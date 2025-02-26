import { Controller, Get, Post, Put, Delete, Body, Param, Res, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { UsersService } from './user.service';
import { PostUserDto } from './dto/post-user.dto';
import { PutUserDto } from './dto/put-user.dto';
import { SignUserDto } from './dto/sign-user.dto';
import { LogInUserDto } from './dto/login-user.dto';
import { PostAdminUserDto } from './dto/post-admin-user.dto';
import { Request, Response } from 'express';
import { AuthGuard, AdminGuard, SuperAdminGuard } from 'src/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';


@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** Login endpoints */
  @Post('/signin/')
  async signIn(@Body() user: SignUserDto, @Res({ passthrough: true }) response: Response){
    return this.usersService.signIn(user, response);
  }

  @Post('/login/')
  async logIn(@Body() user: LogInUserDto, @Res({passthrough: true}) response: Response){
    return this.usersService.logIn(user, response);
  }

  @Post('/refresh/')
  async refreshAccessToken(@Req() request: Request, @Res({passthrough: true}) response: Response){
    return this.usersService.refreshAccessToken(request, response);
  }

  /** Admin endpoints  */
  @UseGuards(SuperAdminGuard)
  @Post('/users/admin/')
  async postUserAdmin(@Body() user: PostAdminUserDto){
    return this.usersService.postAdminUser(user);
  }

  @UseGuards(AdminGuard)
  @Get('/users/')
  async getUsers(){
    return this.usersService.getUsers();
  }

  @UseGuards(AdminGuard)
  @Post('/users/')
  async postUser(@Body() user: PostUserDto){
    return this.usersService.postUser(user)
  }

  /** Client endpoints */
  @UseGuards(AuthGuard)
  @Get('/users/:uuid/')
  async getUser(@Param('uuid') uuid: string){
    return this.usersService.getUser(uuid);
  }

  @UseGuards(AuthGuard)
  @Put('/users/:uuid/')
  async putUser(@Param('uuid') uuid: string, @Body() user: PutUserDto){
    return this.usersService.putUser(uuid, user);
  }

  @UseGuards(AuthGuard)
  @Delete('/users/:uuid/')
  async deleteUser(@Param('uuid') uuid: string){
    return this.usersService.deleteUser(uuid);
  }

  @UseGuards(AuthGuard)
  @Put('/users/deactivate/')
  async deactivateUser(@Param('uuid') uuid: string){
    return this.usersService.changeUserState(uuid, 0);
  }

  @UseGuards(AuthGuard)
  @Put('/users/activate/')
  async activateUser(@Param('uuid') uuid: string){
    return this.usersService.changeUserState(uuid, 1);
  }

  @UseGuards(AuthGuard)
  @Put('/users/image/:uuid')
  @UseInterceptors(FileInterceptor('file'))
  async putUserImage(@Param('uuid') uuid: string, @UploadedFile() file){
    return this.usersService.putUserImage(uuid, file);
  }
}
