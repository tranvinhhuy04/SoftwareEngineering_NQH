import { Injectable } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { ITokenService } from "src/auth/domain/services/token.service";

@Injectable()
export class JwtTokenService implements ITokenService {
  private readonly accessSecret = process.env.JWT_ACCESS_SECRET!;
  private readonly refreshSecret = process.env.JWT_REFRESH_SECRET!;

  generateAccessToken(payload: any): string {
    return jwt.sign(payload, this.accessSecret, { expiresIn: "15m" });
  }

  generateRefreshToken(payload: any): string {
    return jwt.sign(payload, this.refreshSecret, { expiresIn: "7d" });
  }

  verifyAccessToken(token: string): any {
    return jwt.verify(token, this.accessSecret);
  }

  verifyRefreshToken(token: string): any {
    return jwt.verify(token, this.refreshSecret);
  }
}
