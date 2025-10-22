import { Schema, model, Document } from 'mongoose';

export class UserAuth {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly isActive: boolean,
    public readonly role: string,  // ✅ Thêm field role
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
