import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {v4 as uuidv4} from "uuid";

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
  image: string;

  @Prop()
  biography: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop()
  type: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
