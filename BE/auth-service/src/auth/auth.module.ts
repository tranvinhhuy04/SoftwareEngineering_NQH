import { Module } from '@nestjs/common';
import { AuthController } from './presentation/auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthUser, AuthUserSchema } from './infrastructure/database/auth-user.schema';

import { RegisterUserUseCase } from './application/use-cases/register-user.usecase';
import { LoginUseCase } from './application/use-cases/login.usecase';

import { AuthRepositoryImpl } from './infrastructure/repositories/auth.respository.imp';
import { BcryptPasswordService } from './infrastructure/services/bcrypt-password.service';
import { JwtTokenService } from './infrastructure/services/jwt-token.service';

import {
  IAuthRepository,
  IPasswordHashService,
  ITokenService
} from './domain/responsitories/auth.respository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuthUser.name, schema: AuthUserSchema },  // ✔ CHỈ DÒNG NÀY QUAN TRỌNG
    ]),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUserUseCase,
    LoginUseCase,
    { provide: IAuthRepository, useClass: AuthRepositoryImpl },
    { provide: IPasswordHashService, useClass: BcryptPasswordService },
    { provide: ITokenService, useClass: JwtTokenService },
  ],
})
export class AuthModule {}
