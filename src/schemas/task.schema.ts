import { Schema, SchemaFactory } from "@nestjs/mongoose";
import {v4 as uuidv4} from 'uuid';
import { Prop } from "@nestjs/mongoose";
import { User } from "src/users/schemas/user.schema";
import { Document, Schema as MongooseSchema } from "mongoose";
import { Attachment } from "src/schemas/attachment.schema";
import { HydratedDocument } from "mongoose";

export type TaskDocument = HydratedDocument<Task>;

@Schema()
export class Task{
    @Prop({required: true, default: uuidv4, unique: true})
    uuid: string;

    @Prop({required: true})
    name: string;

    @Prop()
    description: string;

    // 0: Cancelado, 1: Pendiente, 2: En proceso, 3: Finalizado
    @Prop({ required: true, default: 0, enum: [0, 1, 2, 3] })
    status: number;

    @Prop({ required: true, ref: 'users', type: MongooseSchema.Types.ObjectId })
    owner: User;

    @Prop({ ref: 'users', type: MongooseSchema.Types.ObjectId, default: [] })
    assignees: User[];

    @Prop()
    attachments: Attachment[]
}

export const TaskSchema = SchemaFactory.createForClass(Task);