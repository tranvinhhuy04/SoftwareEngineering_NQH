import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuthUserDocument = AuthUser & Document;

@Schema({
  timestamps: true
})
export class AuthUser {
  @Prop({ required: false })
  userId: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 'customer' })
  userType: string;
}

export const AuthUserSchema = SchemaFactory.createForClass(AuthUser);
