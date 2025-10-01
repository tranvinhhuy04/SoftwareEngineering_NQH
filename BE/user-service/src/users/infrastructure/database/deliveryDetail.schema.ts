import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Available } from '../../domain/enum/delivery-available.enum';
import { Vehicle } from '../../domain/enum/delivery-vehicle.enum';

export type DeliveryDetailDocument = DeliveryDetail & Document;

@Schema({ timestamps: true, collection: 'DeliveryDetail' })
export class DeliveryDetail{
    @Prop({required: true, unique: true})
    ID: string;

    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    user: Types.ObjectId;

    @Prop({ required: true, enum: Available, default: Available.ASSIGN })
    available: Available;

    @Prop({ required: true, enum: Vehicle, default: Vehicle.MOTORBIKE })
    vehicle_info: Vehicle;
}
export const DeliveryDetailSchema = SchemaFactory.createForClass(DeliveryDetail);