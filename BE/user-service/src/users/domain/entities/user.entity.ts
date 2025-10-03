import { UserType } from "../enum/user-type.enum";
import { UserActive } from "../enum/user-active.enum";
import { DeliveryDetailEntity } from "./deliveryDetail.entity";
import { Types } from "mongoose";

export class UserEntity {
  constructor(
    private readonly _id: Types.ObjectId,
    public readonly ID: string,
    public name: string,
    public email: string,
    public password: string,
    public phone: string,
    public address: string,
    public userType: UserType = UserType.CUSTOMER,
    public active: UserActive = UserActive.ACTIVE,
    private deliveryDetail?: DeliveryDetailEntity
  ) {}

  assignDeliveryDetail(detail: DeliveryDetailEntity) {
    if (this.userType !== UserType.DELIVERY) {
      throw new Error("Only DELIVERY user can have delivery detail");
    }
    this.deliveryDetail = detail;
  }

  getDeliveryDetail(): DeliveryDetailEntity | undefined {
    return this.deliveryDetail;
  }

  get_Id(): Types.ObjectId {
    return this._id;
  }
}
