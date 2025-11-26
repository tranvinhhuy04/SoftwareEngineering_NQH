export class AuthUserEntity {
  constructor(
    public id: string,
    public userId: string,
    public email: string,
    public passwordHash: string,
    public isActive: boolean = true,
    public userType: string = 'customer',
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}
}
