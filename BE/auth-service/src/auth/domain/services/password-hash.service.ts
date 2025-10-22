export interface IPasswordHashService {
  hash(password: string): Promise<string>;
}
