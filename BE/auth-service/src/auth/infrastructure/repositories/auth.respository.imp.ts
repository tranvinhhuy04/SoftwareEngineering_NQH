import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuthUser, AuthUserDocument } from '../database/auth-user.schema';
import { Model } from 'mongoose';
import { IAuthRepository } from '../../domain/responsitories/auth.respository';

@Injectable()
export class AuthRepositoryImpl implements IAuthRepository {
  constructor(
    @InjectModel(AuthUser.name)
    private model: Model<AuthUserDocument>,
  ) {}

  async create(data: any) {
    return this.model.create(data);
  }

  async findByEmail(email: string) {
    return this.model.findOne({ email });
  }
}
