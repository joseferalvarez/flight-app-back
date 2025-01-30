import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/user.module';
import { TravelModule } from './travels/travel.module';

@Module({
  imports: [UserModule, TravelModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
