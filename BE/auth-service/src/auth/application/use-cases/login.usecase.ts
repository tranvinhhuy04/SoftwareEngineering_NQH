import { Inject, Injectable, Logger } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import * as passwordHashService from "src/auth/domain/services/password-hash.service";
import * as tokenService from "src/auth/domain/services/token.service";
import { LoginDto } from "../dto/login.dto";
import * as authRespository from "src/auth/domain/responsitories/auth.respository";

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    @Inject("IUserAuthRepository")
    private readonly authRepo: authRespository.IUserAuthRepository,

    @Inject("IPasswordHashService")
    private readonly hashService: passwordHashService.IPasswordHashService,

    @Inject("ITokenService")
    private readonly tokenService: tokenService.ITokenService,
  ) {}

  async execute(dto: LoginDto) {
    try {
      this.logger.debug(`📥 Login attempt: ${dto.email}`);

      // 1️⃣ Kiểm tra email tồn tại
      const user = await this.authRepo.findByEmail(dto.email);
      if (!user) throw new RpcException({ status: 401, message: "Invalid credentials" });

      // 2️⃣ Kiểm tra trạng thái
      if (!user.isActive) throw new RpcException({ status: 403, message: "Account is disabled" });

      // 3️⃣ So sánh mật khẩu
      const valid = await this.hashService.compare(dto.password, user.passwordHash);
      if (!valid) throw new RpcException({ status: 401, message: "Invalid credentials" });

      // 4️⃣ Sinh token
      const payload = { sub: user.userId, email: user.email };
      const accessToken = this.tokenService.generateAccessToken(payload);
      const refreshToken = this.tokenService.generateRefreshToken(payload);

      this.logger.debug(`✅ Login successful for ${user.email}`);

      // 5️⃣ Trả kết quả
      return {
        accessToken,
        refreshToken,
        user: {
          userId: user.userId,
          email: user.email,
        },
      };
    } catch (err) {
      this.logger.error("❌ Login failed:", err.message);
      throw new RpcException(err.message || "Login failed");
    }
  }
}
