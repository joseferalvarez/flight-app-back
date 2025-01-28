import { Module } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { BootModule } from 'src/config.module';
import { MongooseModule } from '@nestjs/mongoose';
import {User, UserSchema} from './schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BootModule,
    MongooseModule.forFeature([{
      name: User.name,
      schema: UserSchema
    }]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SALT || "salt",
      signOptions: {
        expiresIn: "90 days"
      }
    })
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UserModule {}
