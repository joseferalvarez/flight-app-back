import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './user.service';
import { PostUserDto } from './dto/post-user.dto';
import { GetUserDto } from './dto/get-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(){
    return this.usersService.getUsers();
  }

  @Post()
  async postUser(@Body() user: PostUserDto){
    return this.usersService.postUser(user)
  }

  @Get('/:uuid')
  async getUser(@Param('uuid') uuid: string){
    return this.usersService.getUser(uuid);
  }
}
