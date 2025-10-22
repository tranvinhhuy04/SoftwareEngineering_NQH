export class RefreshToken {
  constructor(
    public readonly tokenId: string,
    public readonly userId: string,
    public readonly userAgent: string,
    public readonly ipAddress: string,
    public readonly issuedAt: Date,
    public readonly expiredAt: Date,
    public revoked: boolean = false,
  ) {}

  revoke() { this.revoked = true; }
  isExpired() { return new Date() > this.expiredAt; }
}
