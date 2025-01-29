import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
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
import {v4 as uuidv4} from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userSchema: Model<UserDocument>,
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

    const accessToken = await this.jwtService.signAsync(payload);
    response.cookie('access_token', accessToken);

    return accessToken;
  }

  async getUsers(): Promise<GetUserDto[]> {
    const UserModel = this.userSchema;

    try{
      const users = await UserModel.find();

      const usersList = await Promise.all(users.map(async (user) => {
        if(!user.image || !user.image.image_url) return user;

        const res = await fetch(user.image.image_url);

        if(res.status === 403){
          const bucketName = process.env.MINIO_DEFAULT_BUCKETS || 'default';
          const bucketExist = await this.minioClient.bucketExists(bucketName);
        
          const signedUrl = await this.minioClient.presignedUrl('GET', bucketName, `users/${user.uuid}/${user.image.image_name}`, 43200);

          const dbUser = await UserModel.findOneAndUpdate({ uuid: user.uuid }, {
              image: {
                image_url: signedUrl
              }
            }, { new: true });

          if(!dbUser) throw new NotFoundException('User not found.');

          return dbUser;
        }

        return user;
      }));
    
      return usersList.filter(user => user);
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

      const res = await fetch(user.image.image_url);

      if(res.status === 403){
        const bucketName = process.env.MINIO_DEFAULT_BUCKETS || 'default';
        const bucketExist = await this.minioClient.bucketExists(bucketName);
    
        if(!bucketExist) throw new BadRequestException('The bucket storage dont exists');

        const signedUrl = await this.minioClient.presignedUrl('GET', bucketName, `users/${uuid}/${user.image.image_name}`, 43200);

        const dbUser = await UserModel.findOneAndUpdate({ uuid: uuid }, {
          image: {
            image_url: signedUrl
          }
       }, { new: true });

       if(!dbUser) throw new NotFoundException('User not found.');

       return dbUser;
      }

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

      const accessToken = this.generateAccessToken(user, response);

      return {
        user: dbUser,
        token: accessToken
      }
    }catch(e){
      throw new BadRequestException(`Error loged in the new user: ${e}`)
    }
  }

  async deactivateUser(uuid){
    const UserModel = this.userSchema;

    try{
      const dbUser = UserModel.findOneAndUpdate({ uuid: uuid }, {
        active: 0
      }, { new: true });

      if(!dbUser) throw new NotFoundException('User not found');
    }catch(e){
      throw new BadRequestException(`Error deactivating the user: ${e}`)
    }
  }

  async putUserImage(uuid, file){
    const bucketName = process.env.MINIO_DEFAULT_BUCKETS || 'default';
    const bucketExist = await this.minioClient.bucketExists(bucketName);

    if(!bucketExist) throw new BadRequestException('The bucket storage dont exists');

    const imageUuid = uuidv4();
    const imageExtension = file.originalname.split('.').pop();

    const imageName = `${imageUuid}.${imageExtension}`;

    const objectName = `users/${uuid}/${imageName}`;

    try{
      const UserModel = this.userSchema;

      await this.minioClient.putObject(bucketName, objectName, file.buffer, file.size, {
        'Content-Type': file.mimetype
      });

      const signedUrl = await this.minioClient.presignedUrl('GET', bucketName, objectName, 10800);

      const dbUser = await UserModel.findOneAndUpdate({ uuid: uuid }, { 
        image: {
          image_name: imageName,
          image_url: signedUrl
        }
       }, { new: true });
      
      return dbUser;
    }catch(e){
      throw new BadRequestException('The user image has not uploaded.')
    }
  }
}
