export class CustomerProfileEntity {
  constructor(
    public readonly ID: string,
    public readonly userId: string,
    public defaultAddress?: string,
    public preferredPaymentMethod?: string,
    public savedPaymentMethods: string[] = [],
    public favoriteItems: string[] = [],
    private readonly _id?: string,
  ) {}

  get_Id(){ return this._id; }
}