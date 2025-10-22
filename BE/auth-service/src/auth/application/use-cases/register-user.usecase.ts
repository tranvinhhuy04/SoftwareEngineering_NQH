import { Inject, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as passwordHashService from 'src/auth/domain/services/password-hash.service';
import * as authRepository from 'src/auth/domain/responsitories/auth.respository';
import { UserAuth } from 'src/auth/domain/entity/auth-user.entity';
import * as userServiceAdapter from 'src/auth/domain/adapter/user-service.adapter';

@Injectable()
export class RegisterUserUseCase {
  private readonly logger = new Logger(RegisterUserUseCase.name);

  constructor(
    @Inject('IUserAuthRepository')
    private readonly repo: authRepository.IUserAuthRepository,

    @Inject('IPasswordHashService')
    private readonly hashService: passwordHashService.IPasswordHashService,

    @Inject('IUserServiceAdapter')
    private readonly userServiceAdapter: userServiceAdapter.IUserServiceAdapter,
  ) {}

  async execute(dto: {
      userId?: string;
      name?: string;
      email: string;
      password: string;
      role?: string;
      userType?: string;
      creatorRole?: string;
      phone?: string;
      address?: string;
      active?: string;
      avatar?: string;
      staffProfile?: any;
      deliveryProfile?: any;
      customerProfile?: any;
    }) {
    {
    try {
      this.logger.debug(`📥 Incoming Register DTO:\n${JSON.stringify(dto, null, 2)}`);

      // 1️⃣ Kiểm tra quyền
      if (dto.creatorRole && dto.creatorRole !== 'admin' && dto.creatorRole !== 'system') {
        throw new RpcException('Permission denied');
      }

      // 2️⃣ Kiểm tra email tồn tại
      const existing = await this.repo.findByEmail(dto.email);
      if (existing) {
        throw new RpcException('Email already exists');
      }

      // 3️⃣ Sinh userId tự động nếu chưa có
      const userId = dto.userId ?? `USR-${Date.now()}`;

      // 4️⃣ Gán role nếu chưa có (map từ userType)
      const role = dto.role ?? dto.userType ?? 'customer';

      // 5️⃣ Hash mật khẩu
      const hash = await this.hashService.hash(dto.password);

      // 6️⃣ Gọi adapter để tạo user trong user-service
      await this.userServiceAdapter.createUser({
        userId,
        name: dto.name,
        email: dto.email,
        password: dto.password, // để user-service có thể lưu riêng
        phone: dto.phone,
        address: dto.address,
        userType: dto.userType,
        active: dto.active ?? 'active',
        avatar: dto.avatar,
        staffProfile: dto.staffProfile,
        deliveryProfile: dto.deliveryProfile,
        customerProfile: dto.customerProfile,
      });

      this.logger.debug(`✅ Created user in user-service (${userId})`);

      // 7️⃣ Lưu thông tin auth-user
      const user = new UserAuth(
        '',
        userId,
        dto.email,
        hash,
        true,
        new Date(),
        new Date(),
      );

      const saved = await this.repo.save(user);
      const mongoId = (saved as any)?._id ?? '(no id)';
      this.logger.debug(`✅ Saved auth-user to MongoDB: ${mongoId}`);

      return { message: 'Register success', userId, email: dto.email, role };
    } catch (error) {
      this.logger.error('❌ RegisterUserUseCase failed:', error);
      throw new RpcException(error.message || 'Registration failed');
    }
  }
}
}
