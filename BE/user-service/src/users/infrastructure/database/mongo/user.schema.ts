import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserType } from '../../../domain/enum/user-type.enum';
import { UserActive } from '../../../domain/enum/user-active.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'Users' })
export class User {

  @Prop({require: true, unique: true})
  ID: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({required: true})
  password: string;

  @Prop({required: true})
  phone: string

  @Prop()
  address: string

  @Prop({required: true, enum:UserType, default:UserType.CUSTOMER})
  userType: UserType

  @Prop({required: true, enum: UserActive, default: UserActive.ACTIVE})
  active: UserActive

  @Prop()
  avatar?: string
}

export const UserSchema = SchemaFactory.createForClass(User);