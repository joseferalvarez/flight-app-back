import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { PostUserDto } from './dto/post-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { PutUserDto } from './dto/put-user.dto';
import { Model } from "mongoose";
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PostAdminUserDto } from './dto/post-admin-user.dto';
import { LogInUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userSchema: Model<UserDocument>,
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

  private async userValid(authorization, uuid): Promise<boolean>{
    const token = authorization.split(" ")[1];
    const payload = await this.jwtService.decode(token);

    if(payload.role === "c" && payload.sub !== uuid) return false;

    return true;
  }

  async getUsers(): Promise<GetUserDto[]> {
    const UserModel = this.userSchema;

    try{
      const users = await UserModel.find({}).exec();
    
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

  async getUser(uuid, headers): Promise<GetUserDto>{
    const UserModel = this.userSchema;

    const userValid = await this.userValid(headers.authorization, uuid);

    //if(!userValid) throw new UnauthorizedException("You have not access to this resource.")

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
}
