import { Module } from '@nestjs/common';
import { TravelController } from './travel.controller';
import { TravelService } from './travel.service';
import { BootModule } from 'src/config.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { Travel, TravelSchema } from './schema/travel.schema';
import { Attachment, AttachmentSchema } from 'src/schemas/attachment.schema';
import { Itinerary, ItinerarySchema } from 'src/schemas/itinerary.schema';
import { Task, TaskSchema } from 'src/schemas/task.schema';
import { Image, ImageSchema } from 'src/schemas/image.schema';
import { Partner, PartnerSchema } from 'src/schemas/partner.schema';

@Module({
  imports: [
    BootModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Travel.name, schema: TravelSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Attachment.name, schema: AttachmentSchema },
      { name: Itinerary.name, schema: ItinerarySchema },
      { name: Image.name, schema: ImageSchema },
      { name: Partner.name, schema: PartnerSchema }
    ])
  ],
  controllers: [TravelController],
  providers: [TravelService],
})

export class TravelModule {}
