import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document} from 'mongoose';
import { User } from './user.schema';
import { Available } from '../../../domain/enum/delivery-available.enum';
import { Vehicle } from '../../../domain/enum/delivery-vehicle.enum';

export type DeliveryProfileDocument = DeliveryProfile & Document;

@Schema({ timestamps: true, collection: 'DeliveryProfile' })
export class DeliveryProfile {
    @Prop({required: true, unique: true})
    ID: string;

    @Prop({ ref: User.name, required: true })
    user: string;

    @Prop({ required: true, enum: Available, default: Available.ASSIGN })
    available: Available;

    @Prop({ required: true, enum: Vehicle, default: Vehicle.MOTORBIKE })
    vehicle_info: Vehicle;
}
export const DeliveryProfileSchema = SchemaFactory.createForClass(DeliveryProfile);