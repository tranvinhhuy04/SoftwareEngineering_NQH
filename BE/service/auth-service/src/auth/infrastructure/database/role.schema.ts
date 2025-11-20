import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoleDocument = RoleSchema & Document;

@Schema({ collection: 'roles', timestamps: true })
export class RoleSchema {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ default: '' })
  description: string;
}

export const RoleSchemaFactory = SchemaFactory.createForClass(RoleSchema);
