import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ required: true }) amount: number;
  @Prop({ required: true }) payment_date: Date;
  @Prop({ required: true, enum: ['MOMO', 'COD', 'ZALO_PAY'] }) payment_gateway: string;
  @Prop({ required: true, enum: ['COMPLETED', 'PENDING', 'FAILED'] }) payment_status: string;
  @Prop({ required: true }) transaction_id: string;
  @Prop({ required: true }) order_id: number;
  @Prop({ required: true }) user_id: number;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
