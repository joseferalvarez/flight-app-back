import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { Model } from 'mongoose';
import * as Minio from 'minio';
import { InjectModel } from '@nestjs/mongoose';
import { Travel, TravelDocument, TravelSchema } from './schema/travel.schema';
import { Task, TaskDocument } from 'src/schemas/task.schema';
import { Attachment, AttachmentDocument } from 'src/schemas/attachment.schema';
import { Itinerary, ItineraryDocument } from 'src/schemas/itinerary.schema';
import { Image, ImageDocument } from 'src/schemas/image.schema';
import { JwtService } from '@nestjs/jwt';
import { NotFoundError } from 'rxjs';
import { Partner, PartnerDocument } from 'src/schemas/partner.schema';

@Injectable()
export class TravelService {
  constructor(
    @InjectModel(User.name) private userSchema: Model<UserDocument>,
    @InjectModel(Travel.name) private travelSchema: Model<TravelDocument>,
    @InjectModel(Task.name) private taskSchema: Model<TaskDocument>,
    @InjectModel(Attachment.name) private attachmentSchema: Model<AttachmentDocument>,
    @InjectModel(Itinerary.name) private itinerarySchema: Model<ItineraryDocument>,
    @InjectModel(Image.name) private imageSchema: Model<ImageDocument>,
    @InjectModel(Partner.name) private partnerSchema: Model<PartnerDocument>,
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
    const PartnerModel = this.partnerSchema;

    const user = await UserModel.findOne({_id: await this.getUserFromToken(request)})
    if(!user) throw new NotFoundException('The user dont exist.');


    const userPartner = await UserModel.findOne({ email: partner.email }).lean();
    if(!userPartner) throw new NotFoundException('The user dont exist.');

    const newPartner = new PartnerModel({ user: userPartner._id, permissions: partner.permissions });
    
    const newTravel = await TravelSchema.findOneAndUpdate(
      { uuid: uuid.uuid, owner: user._id },
      { $addToSet: { partners: newPartner } },
      { new: true }
    );
    
    if(!newTravel) throw new NotFoundException('The travel dont exist.')

    return newTravel;
  }

  async addAttachment(attachment, uuid, request){
    const UserModel = this.userSchema;
    const TravelModel = this.travelSchema;
    const AttachmentModel = this.attachmentSchema;

    const user = await UserModel.findOne({ _id: await this.getUserFromToken(request) });
    if(!user) throw new NotFoundException('The user not exist.');

    const newAttachment = new AttachmentModel({
      name: attachment.name || "",
      url: attachment.url,
      type: attachment.type
    });

    const newTravel = await TravelModel.findOneAndUpdate(
      { uuid: uuid.uuid, owner: user._id },
      { $addToSet: { attachments: newAttachment } },
      { new: true }
    );

    if(!newTravel) throw new NotFoundException('The travel dont exist.');

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
