import { Module } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { BootModule } from 'src/config.module';
import { MongooseModule } from '@nestjs/mongoose';
import {User, UserSchema} from './schemas/user.schema';

@Module({
  imports: [
    BootModule,
    MongooseModule.forFeature([{
      name: User.name,
      schema: UserSchema
    }])
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UserModule {}
