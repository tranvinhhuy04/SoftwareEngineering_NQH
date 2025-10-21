import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';

export type AuthUserDocument = AuthUserSchema & Document;

@Schema({ timestamps: true , collection: 'auth_users' })
export class AuthUserSchema extends Document {
    @Prop({ required: true, unique: true })
    userId: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop({ default: Date.now })
    updatedAt: Date;
}

export const AuthUserSchemaFactory = SchemaFactory.createForClass(AuthUserSchema);