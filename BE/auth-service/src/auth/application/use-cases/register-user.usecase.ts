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

      // 1️⃣ Kiểm tra quyền người tạo (nếu có)
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

      // 5️⃣ Gọi UserService để tạo user trong Mongo
      const userResponse = await this.userServiceAdapter.createUser(payload);
      const userId = userResponse?._id;
      const userType = userResponse?.userType || dto.userType || 'customer';

      if (!userId) throw new RpcException('UserService did not return _id');

      this.logger.debug(`✅ UserService returned _id: ${userId}, userType: ${userType}`);

      // 6️⃣ Chuẩn bị entity để lưu vào Auth DB
      const userEntity = RegisterUserMapper.toAuthEntity(dto, userId, hash);

      // ⚙️ Ghi đè role bằng userType từ UserService để đảm bảo đồng bộ
      (userEntity as any).role = userType;

      this.logger.debug(`🧩 Final role to save in Auth DB: ${userEntity.role}`);

      // 7️⃣ Lưu vào MongoDB Auth
      const saved = await this.repo.save(userEntity);
      const mongoId = (saved as any)?._id ?? '(no id)';

      this.logger.debug(`✅ Saved AuthUser with _id=${mongoId}, userId=${userId}, role=${userEntity.role}`);

      // 8️⃣ Trả kết quả
      return {
        status: 'success',
        message: 'Register success',
        userId,
        email: dto.email,
        role: userEntity.role,
      };

    } catch (error) {
      this.logger.error(`❌ RegisterUserUseCase failed: ${error.message}`);
      throw new RpcException(error.message || 'Registration failed');
    }
  }
}
