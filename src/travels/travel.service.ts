import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Model } from 'mongoose';
import * as Minio from 'minio';
import { InjectModel } from '@nestjs/mongoose';
import { Travel, TravelDocument } from './schema/travel.schema';
import { Task, TaskDocument } from 'src/schemas/task.schema';
import { Attachment, AttachmentDocument } from 'src/schemas/attachment.schema';
import { Itinerary, ItineraryDocument } from 'src/schemas/itinerary.schema';
import { Image, ImageDocument } from 'src/schemas/image.schema';
import { JwtService } from '@nestjs/jwt';
import { NotFoundError } from 'rxjs';

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
    private readonly jwtService: JwtService
  ){}
  getHello(): string {
    return 'Hello World!';
  }

  async postTravel(travel, request){
    const user = await this.getUserFromToken(request);

    const TravelModel = new this.travelSchema({
      name: travel.name,
      owner: user
    });

    const newTravel = await TravelModel.save();

    return newTravel;
  }

  async getTravels(request){
    const user = await this.getUserFromToken(request);

    const TravelModel = this.travelSchema;

    const ownTravels = await TravelModel.findOne({ owner: user });
    const pipeline = [{
      $match: {
        partners: { $in: [user.toString()] }
      }
    }];

    const partnerTravels = await TravelModel.aggregate(pipeline);

    return {
      "owner_travels": ownTravels,
      "partner_travels": partnerTravels
    }
  }

  async addPartner(partner, uuid, request){
    const UserModel = this.userSchema;
    const TravelSchema = this.travelSchema;

    const user = await UserModel.findOne({_id: await this.getUserFromToken(request)})
    if(!user) throw new NotFoundException('The user dont exist.');

    const travel = await TravelSchema.findOne({ uuid: uuid.uuid, owner: user._id });
    if(!travel) throw new NotFoundException('The travel dont exist.');

    const userPartner = await UserModel.findOne({ email: partner.email });
    if(!userPartner) throw new NotFoundException('The user dont exist.');

    console.log(userPartner._id);
    
    const newTravel = await TravelSchema.findOneAndUpdate(
      { uuid: uuid.uuid, owner: user._id },
      { $addToSet: { partners: userPartner._id } },
      { new: true }
    );
    
    if(!newTravel) throw new NotFoundException('The travel dont exist.')

    return newTravel;
  }

  private async getUserFromToken(request){
    const token = request.headers.authorization?.split(" ")[1]
    const payload = this.jwtService.decode(token);
    const UserModel = this.userSchema;

    const user = await UserModel.findOne({ uuid: payload.sub });

    if(!user) throw new NotFoundException('The user dont exist');
    
    return user._id;
  }
}
