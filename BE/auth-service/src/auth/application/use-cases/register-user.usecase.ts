import { Injectable, BadRequestException } from '@nestjs/common';
import {
  IAuthRepository,
  IPasswordHashService,
  ITokenService,
} from '../../domain/responsitories/auth.respository';
import { RegisterUserDto } from '../dto/register-user.dto';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly repo: IAuthRepository,
    private readonly hashService: IPasswordHashService,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(dto: RegisterUserDto) {
    const existing = await this.repo.findByEmail(dto.email);
    if (existing) throw new BadRequestException('User exists');

    const hash = await this.hashService.hash(dto.password);

    const user = await this.repo.create({
      email: dto.email,
      passwordHash: hash,
      role: 'customer',
    });

    const token = await this.tokenService.sign({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return { token, user };
  }
}
