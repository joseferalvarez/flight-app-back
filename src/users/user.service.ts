import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { PostUserDto } from './dto/post-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { PutUserDto } from './dto/put-user.dto';
import { Model } from "mongoose";
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userSchema: Model<UserDocument>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ){}

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
      const rounds = parseInt(this.configService.get<string>("PASS_ROUNDS") || "10", 10);

      const hash = await bcrypt.hash(user.password, rounds);

      const UserModel = new this.userSchema({
        ...user,
        password: hash
      });
    
      return UserModel.save();
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
      const rounds = parseInt(process.env.PASS_ROUNDS || "10");

      const hash = await bcrypt.hash(user.password, rounds);

      const UserModel = new this.userSchema({
        username: user.username,
        email: user.email,
        password: hash
      });
    
      const newUser = await UserModel.save();

      if(!newUser) throw new NotFoundException(`The new user can not singed in`);

      const payload = {
        sub: newUser.uuid,
        username: newUser.username,
        email: newUser.email,
        type: "client"
      }

      const accessToken = await this.jwtService.signAsync(payload);

      response.cookie('access_token', accessToken);

      return {
        user: newUser,
        token: accessToken
      };
    }catch(e){
      throw new BadRequestException(`Error singed in the new user: ${e}`);
    }
  }
}
