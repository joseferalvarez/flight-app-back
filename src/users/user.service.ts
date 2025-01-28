import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { PostUserDto } from './dto/post-user.dto';
import { Model } from "mongoose"

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userSchema: Model<UserDocument>){}

  getHello(): string {
    return 'Hello World!';
  }

  async postUser(user: PostUserDto){
    const userPost = new this.userSchema(user);
    return userPost.save();
  }
}
