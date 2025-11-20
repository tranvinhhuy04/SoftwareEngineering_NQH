import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true , collection: 'auth_users' })
export class AuthUserSchema extends Document {

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string; // ✅ đổi từ password -> passwordHash

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({ required: true, default: 'customer' })
  role: string; // ✅ thêm role

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const AuthUserSchemaDef = SchemaFactory.createForClass(AuthUserSchema);
