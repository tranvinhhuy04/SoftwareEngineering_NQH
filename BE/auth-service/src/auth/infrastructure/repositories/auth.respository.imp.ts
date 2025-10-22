import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserAuth } from 'src/auth/domain/entity/auth-user.entity';
import { IUserAuthRepository } from 'src/auth/domain/responsitories/auth.respository';
import { AuthUserSchema } from '../database/authUser.schema';

@Injectable()
export class UserAuthMongoRepository implements IUserAuthRepository {
  constructor(
    @InjectModel(AuthUserSchema.name)
    private readonly model: Model<AuthUserSchema>,
  ) {}

  async findByEmail(email: string): Promise<UserAuth | null> {
    const doc = await this.model.findOne({ email });
    return doc ? new UserAuth(
      doc.id, doc.userId, doc.email,
      doc.password, doc.isActive, doc.createdAt, doc.updatedAt
    ) : null;
  }

  async save(user: UserAuth): Promise<UserAuth> {
    const created = await this.model.create({
      userId: user.userId,
      email: user.email,
      password: user.passwordHash,
      isActive: user.isActive,
    });
    return new UserAuth(
      created.id, created.userId, created.email,
      created.password, created.isActive,
      created.createdAt, created.updatedAt,
    );
  }
}