import { Types } from "mongoose";
import { StaffShift } from "../enum/staff-shift.enum";

export class StaffProfileEntity {
  constructor(
    private readonly _id: Types.ObjectId,
    public readonly ID: string,
    public readonly userId: Types.ObjectId,
    public shift: StaffShift = StaffShift.MORNING,
    public isActive: boolean = true,
    public handledOrders: number = 0, //giúp dễ tính KPI, thống kê ca làm, hoặc sinh báo cáo trong Dashboard.
  ) {}

  get_Id(): Types.ObjectId {
    return this._id;
  }
}