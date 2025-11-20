export interface IPasswordService {
    hashPassword(password: string): Promise<string>;
    comparePassword(password: string, hashed: string): Promise<boolean>;
}
