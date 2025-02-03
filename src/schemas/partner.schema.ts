import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "src/users/schemas/user.schema";
import { Document, Schema as MongooseSchema } from "mongoose";
import { HydratedDocument } from "mongoose";

export type PartnerDocument = HydratedDocument<Partner>;

@Schema()
export class Partner{
    @Prop({ required: true, ref: 'users', type: MongooseSchema.Types.ObjectId })
    user: User

    // v: Viewer, e: Editor
    @Prop({type: String, default: 'v', enum: ['v', 'e']})
    permissions: string;
}

export const PartnerSchema = SchemaFactory.createForClass(Partner);