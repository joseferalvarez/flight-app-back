import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {v4 as uuidv4} from "uuid";
import { Image } from 'src/schemas/image.schema';
import { Document, Schema as MongooseSchema } from "mongoose";
import { Travel } from 'src/travels/schema/travel.schema';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ type: String, required: true, default: uuidv4, unique: true })
  uuid: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, unique: true })
  email: string

  @Prop()
  name: string;

  @Prop()
  lastname: string;

  @Prop()
  image: Image;

  @Prop()
  biography: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  // Superadministrador (s), Administrador (a), Cliente (c)
  @Prop({ required: true, default: "c", enum: ["s", "a", "c"]})
  role: string;

  //Activado (1), Desactivado (0)
  @Prop({ required: true, default: 1, enum: [0, 1] })
  active: number;

  @Prop({ ref: 'travels', type: MongooseSchema.Types.ObjectId })
  travels: Travel[];
}

export const UserSchema = SchemaFactory.createForClass(User);
