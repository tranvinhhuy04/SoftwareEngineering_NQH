import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserType } from '../enum/user-type.enum';
import { UserActive } from '../enum/user-active.enum';

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

  @Prop({required: true, default:UserType.CUSTOMER})
  userType: UserType

  @Prop({required: true, default: UserActive.ACTIVE})
  active: UserActive
}

export const UserSchema = SchemaFactory.createForClass(User);