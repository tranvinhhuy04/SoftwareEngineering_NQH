import { Injectable } from '@nestjs/common';
import { JwtProvider } from '../../infrastructure/providers/jwt.provider';

@Injectable()
export class JwtService {
  constructor(private readonly jwtProvider: JwtProvider) {}

  generateTokens(user: any) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.userType,
    };

    const accessToken = this.jwtProvider.signAccessToken(payload);
    const refreshToken = this.jwtProvider.signRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  validateAccessToken(token: string) {
    try {
      return this.jwtProvider.verifyAccessToken(token);
    } catch {
      return null;
    }
  }

  validateRefreshToken(token: string) {
    try {
      return this.jwtProvider.verifyRefreshToken(token);
    } catch {
      return null;
    }
  }
}
