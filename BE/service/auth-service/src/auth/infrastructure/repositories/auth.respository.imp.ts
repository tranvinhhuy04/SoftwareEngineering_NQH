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

  /**
   * 🔍 Tìm user theo email
   */
  async findByEmail(email: string): Promise<UserAuth | null> {
    const doc = await this.model.findOne({ email }).lean();

    if (!doc) return null;

    return new UserAuth(
      doc._id?.toString() ?? '',
      doc.userId,
      doc.email,
      doc.passwordHash,
      doc.isActive,
      doc.role || 'customer', // ✅ nếu chưa có role thì fallback
      doc.createdAt,
      doc.updatedAt,
    );
  }

  /**
   * 💾 Lưu user mới vào MongoDB
   */
  async save(user: UserAuth): Promise<UserAuth> {
    // ⚙️ Dùng đúng key `passwordHash` và `role`
    const created = await this.model.create({
      userId: user.userId,
      email: user.email,
      passwordHash: user.passwordHash, // ✅ không phải password
      isActive: user.isActive,
      role: user.role,                 // ✅ đảm bảo đúng role được truyền
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    return new UserAuth(
      created.id.toString(),
      created.userId,
      created.email,
      created.passwordHash,
      created.isActive,
      created.role || 'customer',
      created.createdAt,
      created.updatedAt,
    );
  }
}
