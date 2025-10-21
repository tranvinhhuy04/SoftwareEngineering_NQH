import { Schema, model, Document } from 'mongoose';

export class UserAuth {
  constructor(
    public readonly id: string,
    public readonly userId: string,        // Liên kết với User Service
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
