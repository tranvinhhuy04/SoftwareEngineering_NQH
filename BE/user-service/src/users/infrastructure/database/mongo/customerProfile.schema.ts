import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "./user.schema";

export type CustomerProfileDocument = CustomerProfile & Document;

@Schema({ timestamps: true, collection: 'CustomerProfile' })
export class CustomerProfile{
    @Prop({required: true, unique: true})
    ID: string;
    
    @Prop({ref: User.name, required: true })
    user: string;

    @Prop()
    defaultAddress: string;

   @Prop()
   preferredPaymentMethod?: string;

   @Prop({ type: [String], default: [] })
   savedPaymentMethods: string[] = [];

   @Prop({ type: [String], default: [] })
   favoriteItems: string[] = [];
}
export const CustomerProfileSchema = SchemaFactory.createForClass(CustomerProfile);