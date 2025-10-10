export class RefreshToken {
  constructor(
    public readonly tokenId: string,     // jti trong JWT
    public readonly userId: string,
    public readonly issuedAt: Date,
    public readonly expiredAt: Date,
    public revoked: boolean = false,
  ) {}

  revoke() { this.revoked = true; }
  isExpired() { return new Date() > this.expiredAt; }
}
