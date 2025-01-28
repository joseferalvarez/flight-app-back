import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './user.service';
import { PostUserDto } from './dto/post-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/hello/')
  getHello(): string {
    return this.usersService.getHello();
  }

  @Post()
  async postUser(@Body() user: PostUserDto){
    return this.usersService.postUser(user)
  }
}
