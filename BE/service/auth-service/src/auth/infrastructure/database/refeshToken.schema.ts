import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RefreshTokenDocument = RefreshTokenSchema & Document;

@Schema({ collection: 'refresh_tokens' })
export class RefreshTokenSchema {
  @Prop({ required: true, unique: true })
  tokenId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userAgent: string;

  @Prop({ required: true })
  ipAddress: string;

  @Prop({ required: true })
  issuedAt: Date;

  @Prop({ required: true })
  expiredAt: Date;

  @Prop({ default: false })
  revoked: boolean;
}

export const RefreshTokenSchemaFactory = SchemaFactory.createForClass(RefreshTokenSchema);
