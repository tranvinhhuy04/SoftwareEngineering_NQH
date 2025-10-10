export class AuthUser {
  constructor(
    private readonly userId: string,
    private readonly email: string,
    private readonly roles: string[],
    private readonly active: boolean,
  ) {}

  getId() { return this.userId; }
  getEmail() { return this.email; }
  getRoles() { return this.roles; }
  isActive() { return this.active; }
}
