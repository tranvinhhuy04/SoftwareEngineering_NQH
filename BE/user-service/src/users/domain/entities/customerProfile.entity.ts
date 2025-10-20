import { Types } from "mongoose";

export class CustomerProfileEntity {
  constructor(
    public readonly ID: string,
    public readonly userId: Types.ObjectId,
    public defaultAddress?: string,
    public preferredPaymentMethod?: string,
    public savedPaymentMethods: string[] = [],
    public favoriteItems: string[] = [],
    private readonly _id?: Types.ObjectId,
  ) {}

  get_Id(){ return this._id; }
}