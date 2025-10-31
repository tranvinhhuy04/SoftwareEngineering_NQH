import { UserAuth } from "../entity/auth-user.entity";

export interface IUserAuthRepository  {
    findByEmail(email: string): Promise<UserAuth | null>;
    save(user: UserAuth): Promise<UserAuth>;
}