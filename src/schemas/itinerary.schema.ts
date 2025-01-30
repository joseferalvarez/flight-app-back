import { Prop, SchemaFactory } from "@nestjs/mongoose";
import { Date } from "mongoose";
import { User } from "src/users/schemas/user.schema";
import { v4 as uuidv4 } from 'uuid';
import { Document, Schema as MongooseSchema } from "mongoose";
import { Attachment } from "./attachment.schema";
import { HydratedDocument } from "mongoose";

export type ItineraryDocument = HydratedDocument<Itinerary>;

export class Itinerary{
    @Prop({ required: true, default: uuidv4})
    uuid: string;

    @Prop( { required: true })
    name: string;

    @Prop({type: Date})
    date_init: Date

    @Prop({type: Date})
    date_end: Date

    @Prop()
    type: string

    @Prop()
    place: string;

    @Prop()
    description: string;

    @Prop({ required: true, ref: 'users', type: MongooseSchema.Types.ObjectId })
    owner: User;

    @Prop({ ref: 'users', type: MongooseSchema.Types.ObjectId })
    partners: User[];

    @Prop()
    attachments: Attachment[];

    @Prop()
    total_price: string;

    @Prop()
    single_price: string;
}

export const ItinerarySchema = SchemaFactory.createForClass(Itinerary);