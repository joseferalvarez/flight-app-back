import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

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
