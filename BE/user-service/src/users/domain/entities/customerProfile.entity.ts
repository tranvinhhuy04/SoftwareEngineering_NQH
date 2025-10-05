import { Types } from "mongoose";

export class CustomerProfileEntity {
  constructor(
    private readonly _id: Types.ObjectId,
    public readonly ID: string,
    public readonly userId: Types.ObjectId,
    public defaultAddress?: string,
    public preferredPaymentMethod?: string,
    public savedPaymentMethods: string[] = [],
    public favoriteItems: string[] = [],
  ) {}

  get_Id(): Types.ObjectId {
    return this._id;
  }
}