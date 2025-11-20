import { IPasswordService } from './password-service.interface';
export declare class BcryptPasswordService implements IPasswordService {
    private readonly SALT_ROUNDS;
    hashPassword(password: string): Promise<string>;
    comparePassword(password: string, hashed: string): Promise<boolean>;
}
