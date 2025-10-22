import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { User } from "./user.schema";

export type StaffProfileDocument = StaffProfile & Document;

@Schema({ timestamps: true, collection: 'StaffProfile' })
export class StaffProfile {
    @Prop({required: true, unique: true})
    ID: string;

    @Prop({ref: User.name, required: true })
    user: string;

    @Prop({ required: true, default: 'MORNING' })
    shift: string;

    @Prop({ required: true, default: true })
    isActive: boolean;

    @Prop({ required: true, default: 0 })
    handledOrders: number; 
}
export const StaffProfileSchema = SchemaFactory.createForClass(StaffProfile);
