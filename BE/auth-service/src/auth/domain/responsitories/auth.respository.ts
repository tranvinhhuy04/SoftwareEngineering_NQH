export abstract class IAuthRepository {
  abstract create(data: any): Promise<any>;
  abstract findByEmail(email: string): Promise<any>;
}

export abstract class IPasswordHashService {
  abstract hash(password: string): Promise<string>;
  abstract compare(password: string, hash: string): Promise<boolean>;
}

export abstract class ITokenService {
  abstract sign(payload: any): Promise<string>;
}
