import { Schema, SchemaFactory } from "@nestjs/mongoose";
import {v4 as uuidv4} from 'uuid';
import { Prop } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ImageDocument = HydratedDocument<Image>;

@Schema()
export class Image{
    @Prop({required: true, default: uuidv4, unique: true})
    uuid: string;

    @Prop({ required: true })
    url: string;
}

export const ImageSchema = SchemaFactory.createForClass(Image);