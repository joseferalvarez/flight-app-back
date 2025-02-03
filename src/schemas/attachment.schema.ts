import { Schema, SchemaFactory } from "@nestjs/mongoose";
import {v4 as uuidv4} from 'uuid';
import { Prop } from "@nestjs/mongoose";
import { User } from "src/users/schemas/user.schema";
import { Document, Schema as MongooseSchema } from "mongoose";
import { HydratedDocument } from "mongoose";

export type AttachmentDocument = HydratedDocument<Attachment>;

@Schema()
export class Attachment{
    @Prop({required: true, default: uuidv4, unique: true})
    uuid: string;

    name: string;

    @Prop({required: true})
    url: string;

    @Prop({ required: true, default: 'i', enum: ['image', 'video', 'pdf', 'external'] })
    type: string;

    @Prop({ required: true, ref: 'users', type: MongooseSchema.Types.ObjectId })
    owner: User;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);