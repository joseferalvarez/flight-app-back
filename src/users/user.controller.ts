import { Controller, Get, Post, Put, Delete, Body, Param, Res, UseGuards } from '@nestjs/common';
import { UsersService } from './user.service';
import { PostUserDto } from './dto/post-user.dto';
import { PutUserDto } from './dto/put-user.dto';
import { SignUserDto } from './dto/sign-user.dto';
import { Response } from 'express';
import { AuthGuard } from 'src/auth.guard';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/signin/')
  async signIn(@Body() user: SignUserDto, @Res({ passthrough: true }) response: Response){
    return this.usersService.signIn(user, response);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getUsers(){
    return this.usersService.getUsers();
  }

  @Post()
  async postUser(@Body() user: PostUserDto){
    return this.usersService.postUser(user)
  }

  @Get('/:uuid/')
  async getUser(@Param('uuid') uuid: string){
    return this.usersService.getUser(uuid);
  }

  @Put('/:uuid/')
  async putUser(@Param('uuid') uuid: string, @Body() user: PutUserDto){
    return this.usersService.putUser(uuid, user);
  }

  @Delete('/:uuid/')
  async deleteUser(@Param('uuid') uuid: string){
    return this.usersService.deleteUser(uuid);
  }
}
