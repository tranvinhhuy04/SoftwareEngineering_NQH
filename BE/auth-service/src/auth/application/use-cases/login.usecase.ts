import { Inject, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as authRepository from 'src/auth/domain/responsitories/auth.respository';
import * as passwordHashService from 'src/auth/domain/services/password-hash.service';
import * as tokenService from 'src/auth/domain/services/token.service';

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    @Inject('IUserAuthRepository')
    private readonly repo: authRepository.IUserAuthRepository,

    @Inject('IPasswordHashService')
    private readonly hashService: passwordHashService.IPasswordHashService,

    @Inject('ITokenService')
    private readonly tokenService: tokenService.ITokenService,
  ) {}

  async execute(dto: { email: string; password: string }) {
    try {
      this.logger.debug(`📥 Login attempt: ${dto.email}`);

      // 1️⃣ Tìm user trong Auth DB
      const userAuth = await this.repo.findByEmail(dto.email);
      if (!userAuth) throw new RpcException('Invalid email or password');

      // 2️⃣ Kiểm tra mật khẩu
      const valid = await this.hashService.compare(dto.password, userAuth.passwordHash);
      if (!valid) throw new RpcException('Invalid email or password');

      // 3️⃣ Lấy role từ Auth DB (không gọi sang UserService)
      const role = userAuth.role || 'customer';
      const permissions = this.mapRoleToPermissions(role);

      // 4️⃣ Sinh token JWT
      const payload = { userId: userAuth.userId, email: userAuth.email, role, permissions };
      const accessToken = this.tokenService.generateAccessToken(payload);
      const refreshToken = this.tokenService.generateRefreshToken({ userId: userAuth.userId });

      this.logger.debug(`✅ Login successful for ${userAuth.email} with role=${role}`);

      // 5️⃣ Trả kết quả
      return {
        user: { userId: userAuth.userId, email: userAuth.email, role, permissions },
        accessToken,
        refreshToken,
      };
    } catch (err) {
      this.logger.error(`❌ Login failed: ${err.message}`);
      throw new RpcException('Internal server error');
    }
  }

  private mapRoleToPermissions(role: string): string[] {
    switch (role) {
      case 'admin':
        return ['manage_users', 'manage_payments', 'view_reports'];
      case 'restaurant-staff':
        return ['view_orders', 'update_menu', 'confirm_delivery'];
      case 'delivery-person':
        return ['view_assigned_orders', 'update_status'];
      case 'customer':
        return ['create_order', 'view_order_history'];
      default:
        return [];
    }
  }
}
