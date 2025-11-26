import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  IAuthRepository,
  IPasswordHashService,
  ITokenService,
} from '../../domain/responsitories/auth.respository';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly repo: IAuthRepository,
    private readonly hashService: IPasswordHashService,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(dto: LoginDto) {
    const user = await this.repo.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await this.hashService.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = await this.tokenService.sign({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return { token, user };
  }
}
