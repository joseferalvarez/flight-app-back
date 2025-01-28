import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { PostUserDto } from './dto/post-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { Model } from "mongoose";
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userSchema: Model<UserDocument>,
    private readonly configService: ConfigService
  ){}

  async getUsers(): Promise<GetUserDto[]> {
    const UserModel = this.userSchema;
    const users = await UserModel.find({}).exec();
    
    return users;
  }

  async postUser(user: PostUserDto){
    const rounds = parseInt(this.configService.get<string>("PASS_ROUNDS") || "10", 10);

    const hash = await bcrypt.hash(user.password, rounds);

    const UserModel = new this.userSchema({
      ...user,
      password: hash
    });
    
    return UserModel.save();
  }

  async getUser(uuid): Promise<GetUserDto>{
    const UserModel = this.userSchema;
    const user = await UserModel.findOne({ uuid: uuid }).exec();

    if(!user) throw new NotFoundException(`User with ${uuid} not found`);

    return user;
  }
}
