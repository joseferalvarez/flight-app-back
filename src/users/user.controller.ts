import { Controller, Get } from '@nestjs/common';
import { UsersService } from './user.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/hello/')
  getHello(): string {
    return this.usersService.getHello();
  }
}
