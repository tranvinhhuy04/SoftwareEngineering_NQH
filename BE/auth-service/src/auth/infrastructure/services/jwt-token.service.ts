import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ITokenService } from '../../domain/responsitories/auth.respository';

@Injectable()
export class JwtTokenService implements ITokenService {
  async sign(payload: any): Promise<string> {

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is missing in environment variables');
    }

    return jwt.sign(payload, secret, { expiresIn: '7d' });
  }
}
