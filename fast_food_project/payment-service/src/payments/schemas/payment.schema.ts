import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema()
export class Payment {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'pending' })
  status: string; // pending | success | failed
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
