import { Injectable, Inject } from '@nestjs/common';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Model } from 'mongoose';
import * as Minio from 'minio';
import { InjectModel } from '@nestjs/mongoose';
import { Travel, TravelDocument } from './schema/travel.schema';
import { Task, TaskDocument } from 'src/schemas/task.schema';
import { Attachment, AttachmentDocument } from 'src/schemas/attachment.schema';
import { Itinerary, ItineraryDocument } from 'src/schemas/itinerary.schema';
import { Image, ImageDocument } from 'src/schemas/image.schema';

@Injectable()
export class TravelService {
  constructor(
    @InjectModel(User.name) private userSchema: Model<UserDocument>,
    @InjectModel(Travel.name) private travelSchema: Model<TravelDocument>,
    @InjectModel(Task.name) private taskSchema: Model<TaskDocument>,
    @InjectModel(Attachment.name) private attachmentSchema: Model<AttachmentDocument>,
    @InjectModel(Itinerary.name) private itinerarySchema: Model<ItineraryDocument>,
    @InjectModel(Image.name) private imageSchema: Model<ImageDocument>,
    @Inject('MINIO_CLIENT') private readonly minioClient: Minio.Client,
  ){}
  getHello(): string {
    return 'Hello World!';
  }
}
