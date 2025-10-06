import { Types } from "mongoose";
import { UserType } from "../enum/user-type.enum";
import { UserActive } from "../enum/user-active.enum";
import { DeliveryProfileEntity } from "./deliveryProfile.entity";
import { CustomerProfileEntity } from "./customerProfile.entity";
import { StaffProfileEntity } from "./staffProfile.entity";

export class UserEntity {
  constructor(
    public readonly ID: string,
    public name: string,
    public email: string,
    public password: string,
    public phone: string,
    public address: string,
    public avatar?: string,
    public userType: UserType = UserType.CUSTOMER,
    public active: UserActive = UserActive.ACTIVE,
    private customerProfile?: CustomerProfileEntity,
    private staffProfile?: StaffProfileEntity,
    private deliveryProfile?: DeliveryProfileEntity,
    private _id?: Types.ObjectId,
  ) {}

  // --- Domain Logic ---
  assignCustomerProfile(profile: CustomerProfileEntity) {
    if (this.userType !== UserType.CUSTOMER)
      throw new Error("Only CUSTOMER user can have a customer profile");
    this.customerProfile = profile;
  }

  assignStaffProfile(profile: StaffProfileEntity) {
    if (this.userType !== UserType.STAFF)
      throw new Error("Only STAFF user can have a staff profile");
    this.staffProfile = profile;
  }

  assignDeliveryProfile(profile: DeliveryProfileEntity) {
    if (this.userType !== UserType.DELIVERY)
      throw new Error("Only DELIVERY user can have delivery profile");
    this.deliveryProfile = profile;
  }

  // --- Getters ---
  get_Id() { return this._id; }
  getCustomerProfile() { return this.customerProfile; }
  getStaffProfile() { return this.staffProfile; }
  getDeliveryProfile() { return this.deliveryProfile; }
}
