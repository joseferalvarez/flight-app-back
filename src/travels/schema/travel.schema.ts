import { Schema, SchemaFactory } from "@nestjs/mongoose";
import {v4 as uuidv4} from 'uuid';
import { Prop } from "@nestjs/mongoose";
import { Date, HydratedDocument } from "mongoose";
import { User } from "src/users/schemas/user.schema";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Image } from "src/schemas/image.schema";
import { Attachment } from "src/schemas/attachment.schema";
import { Task } from "src/schemas/task.schema";
import { Partner } from "src/schemas/partner.schema";

export type TravelDocument = HydratedDocument<Travel>;

@Schema()
export class Travel{
    @Prop({type: String, required: true, default: uuidv4, unique: true})
    uuid: string;

    @Prop({type: String, required: true})
    name: string;

    @Prop({type: Date})
    init_date: Date;

    @Prop({type: Date})
    end_date: Date;
    
    // 0: Cancelado, 1: Pendiente, 2: En curso, 3: Finalizado
    @Prop({required: true, default: 1, enum: [0, 1, 2, 3]})
    status: number;

    @Prop()
    tasks: Task[];

    @Prop()
    attachments: Attachment[]

    @Prop({ required: true, ref: 'users', type: MongooseSchema.Types.ObjectId })
    owner: User;

    @Prop({ ref: 'users', type: [Partner] })
    partners: Partner[];

    @Prop()
    gallery: Image[];
}

export const TravelSchema = SchemaFactory.createForClass(Travel);

