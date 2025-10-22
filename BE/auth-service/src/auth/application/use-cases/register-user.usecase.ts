import { Inject, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as passwordHashService from 'src/auth/domain/services/password-hash.service';
import * as authRepository from 'src/auth/domain/responsitories/auth.respository';
import { RegisterUserDto } from '../dto/register-user.dto';
import { RegisterUserMapper } from '../mappers/register-user.mapper';
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

  async execute(dto: RegisterUserDto) {
    try {
      this.logger.debug(`📥 Incoming Register DTO:\n${JSON.stringify(dto, null, 2)}`);

      // 1️⃣ Kiểm tra quyền tạo tài khoản
      if (dto.creatorRole && dto.creatorRole !== 'admin' && dto.creatorRole !== 'system') {
        throw new RpcException('Permission denied');
      }

      // 2️⃣ Kiểm tra email trùng trong Auth DB
      const existing = await this.repo.findByEmail(dto.email);
      if (existing) throw new RpcException('Email already exists');

      // 3️⃣ Hash mật khẩu
      const hash = await this.hashService.hash(dto.password);

      // 4️⃣ Chuẩn bị payload gửi sang UserService
      const payload = RegisterUserMapper.toUserServicePayload(dto);
      this.logger.debug(`📤 Sending create_user via RMQ:\n${JSON.stringify(payload, null, 2)}`);

      // 5️⃣ Gọi UserService để tạo user mới
      const userResponse = await this.userServiceAdapter.createUser(payload);
      const userId = userResponse?._id; // ✅ nhận _id Mongo thật
      if (!userId) throw new RpcException('UserService did not return _id');

      this.logger.debug(`✅ UserService returned _id: ${userId}`);

      // 6️⃣ Lưu thông tin vào Auth DB
      const userEntity = RegisterUserMapper.toAuthEntity(dto, userId, hash);
      const saved = await this.repo.save(userEntity);
      const mongoId = (saved as any)?._id ?? '(no id)';

      this.logger.debug(`✅ Saved AuthUser with _id=${mongoId}, userId=${userId}`);

      return { message: 'Register success', userId, email: dto.email };
    } catch (error) {
      this.logger.error('❌ RegisterUserUseCase failed:', error);
      throw new RpcException(error.message || 'Registration failed');
    }
  }
}
