import { StaffShift } from "../enum/staff-shift.enum";

export class StaffProfileEntity {
  constructor(
    public readonly ID: string,
    public readonly userId: string,
    public shift: StaffShift = StaffShift.MORNING,
    public isActive: boolean = true,
    public handledOrders: number = 0, //giúp dễ tính KPI, thống kê ca làm, hoặc sinh báo cáo trong Dashboard.
    private _id?: string,
  ) {}

  get_Id() { return this._id; }

}