import { UserEntity } from "../entities/user.entity";

export interface IUserRepository {
  save(user: UserEntity): Promise<UserEntity>;
  update(id: string, user: UserEntity): Promise<UserEntity>;
  remove(id: string): Promise<void>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  findByFilters(filters: any): Promise<UserEntity[]>;
}
