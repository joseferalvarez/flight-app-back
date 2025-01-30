import { Injectable, NotFoundException, BadRequestException, Inject, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { PostUserDto } from './dto/post-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { PutUserDto } from './dto/put-user.dto';
import { Model } from "mongoose";
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PostAdminUserDto } from './dto/post-admin-user.dto';
import { LogInUserDto } from './dto/login-user.dto';
import * as Minio from 'minio';
import { RefreshTokenDto } from './dto/refresh-token-dto';
import { Image, ImageDocument } from 'src/schemas/image.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userSchema: Model<UserDocument>,
    @InjectModel(Image.name) private imageSchema: Model<ImageDocument>,
    @Inject('MINIO_CLIENT') private readonly minioClient: Minio.Client,
    private readonly jwtService: JwtService
  ){}

  private async generateHash(password): Promise<string>{
    const rounds = parseInt(process.env.PASS_ROUNDS || "10");
    const hash = await bcrypt.hash(password, rounds);

    return hash;
  }

  private async generateAccessToken(user, response){
    const payload = {
      sub: user.uuid,
      username: user.username,
      email: user.email,
      role: user.role
    }

    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
    const refreshToken = await this.jwtService.signAsync(payload, {expiresIn: process.env.REFRESH_TOKEN_EXPIRATION});
    response.cookie('access_token', accessToken);
    response.cookie('refresh_token', refreshToken);

    return {accessToken: accessToken, refreshToken: refreshToken};
  }

  async refreshAccessToken(request, response): Promise<RefreshTokenDto>{
    
    const refreshToken = request.cookies['refresh_token'];

    if(!refreshToken) throw new NotFoundException('The refresh token has no been found.');

    const payload = await this.jwtService.verifyAsync(refreshToken, { secret: process.env.JWT_SALT });

    const newPayload = {
      sub: payload.uuid,
      username: payload.username,
      email: payload.email,
      role: payload.role
    };

    if(!payload) throw new UnauthorizedException('The refresh token is not valid.');

    const newAccessToken = await this.jwtService.signAsync(newPayload, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
    const newRefreshToken = await this.jwtService.signAsync(newPayload, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
    response.cookie('access_token', newAccessToken);
    response.cookie('refresh_token', newRefreshToken);

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken
    };
  }

  async getUsers(): Promise<GetUserDto[]> {
    const UserModel = this.userSchema;

    try{
      const users = await UserModel.find();
    
      return users;
    }catch(e){
      throw new BadRequestException(`Error listing the users: ${e}`);
    }
    
  }

  async postUser(user: PostUserDto){

    try{
      const UserModel = new this.userSchema({
        ...user,
        password: await this.generateHash(user.password)
      });
    
      return UserModel.save();
    }catch(e){
      throw new BadRequestException(`Error posting the new user: ${e}`);
    }

  }

  async postAdminUser(user: PostAdminUserDto){

    try{
      const UserModel = new this.userSchema({
        ...user,
        password: await this.generateHash(user.password)
      });
    
      return UserModel.save();
    }catch(e){
      throw new BadRequestException(`Error posting the new user: ${e}`);
    }
    
  }

  async postSuperAdminUser(username, email, password){
    try{
      const UserModel = new this.userSchema({
        username: username,
        email: email,
        password: await this.generateHash(password),
        role: "s"
      })

      return UserModel.save()
    }catch(e){
      throw new BadRequestException(`Error posting the new user: ${e}`);
    }
  }

  async getUser(uuid): Promise<GetUserDto>{
    const UserModel = this.userSchema;

    try{
      const user = await UserModel.findOne({ uuid: uuid }).exec();

      if(!user) throw new NotFoundException(`User with id ${uuid} not found`);

      return user;
    }catch(e){
      throw new BadRequestException(`Error getting the user with id ${uuid}: ${e}`);
    }

  }

  async putUser(uuid, newUser): Promise<PutUserDto>{
    const UserModel = this.userSchema;

    try{
      const user = await UserModel.findOneAndUpdate(
        { 
          uuid: uuid 
        },
        {
          name: newUser.name,
          lastname: newUser.name,
          biography: newUser.biography,
          phone: newUser.phone,
          address: newUser.address
        },
        { 
          new: true 
        }
      );

      if(!user) throw new NotFoundException(`User with ${uuid} not found`);

      return user;

    }catch(e){
      throw new BadRequestException(`Error updating the user: ${e}`);
    }

  }

  async deleteUser(uuid): Promise<string>{
    const UserModel = this.userSchema;

    try{
      const user = UserModel.findOneAndDelete({ uuid: uuid }).exec();

      if(!user) throw new NotFoundException(`User with id ${uuid} not found`);

      return `User with id ${uuid} deleted`;
    }catch(e){
      throw new BadRequestException(`Error deleting the user with id ${uuid}: ${e}`)
    }

  }

  async signIn(user, response){
    try{
      
      const UserModel = new this.userSchema({
        username: user.username,
        email: user.email,
        password: await this.generateHash(user.password)
      });
    
      const newUser = await UserModel.save();

      if(!newUser) throw new NotFoundException(`The new user can not singed in`);

      const accessToken = this.generateAccessToken(user, response);

      return {
        user: newUser,
        token: accessToken
      };
    }catch(e){
      throw new BadRequestException(`Error singed in the new user: ${e}`);
    }

  }

  async logIn(user: LogInUserDto, response){
    const UserModel = this.userSchema;

    try{

      const dbUser = await UserModel.findOne({email: user.email})

      if(!dbUser) throw new NotFoundException(`The email is not correct, sign in with a new user.`);

      const {accessToken, refreshToken} = await this.generateAccessToken(user, response);

      return {
        user: dbUser,
        access_token: accessToken,
        refresh_token: refreshToken
      }
    }catch(e){
      throw new BadRequestException(`Error loged in the new user: ${e}`)
    }
  }

  async changeUserState(uuid, state){
    const UserModel = this.userSchema;

    try{
      const dbUser = UserModel.findOneAndUpdate({ uuid: uuid }, {
        active: state
      }, { new: true });

      if(!dbUser) throw new NotFoundException('User not found');
    }catch(e){
      throw new BadRequestException(`Error deactivating the user: ${e}`)
    }
  }

  async putUserImage(uuid, file){
    const bucketName = process.env.MINIO_USERS_BUCKET || 'default';
    const bucketExist = await this.minioClient.bucketExists(bucketName);

    if(!bucketExist) throw new BadRequestException('The bucket storage dont exists');

    const imageExtension = file.originalname.split('.').pop();

    const imageName = `${uuid}.${imageExtension}`;

    const objectName = `${uuid}/${imageName}`;

    try{
      const UserModel = this.userSchema;
      const ImageModel = this.imageSchema;

      await this.minioClient.putObject(bucketName, objectName, file.buffer, file.size, {
        'Content-Type': file.mimetype
      });

      const signedUrl = await this.minioClient.presignedUrl('GET', bucketName, objectName);

      const image = new ImageModel({
        uuid: uuid(),
        url: signedUrl
      });

      const dbUser = await UserModel.findOneAndUpdate({ uuid: uuid }, { image: image }, { new: true });
      
      return dbUser;
    }catch(e){
      throw new BadRequestException('The user image has not been uploaded.')
    }
  }
}
