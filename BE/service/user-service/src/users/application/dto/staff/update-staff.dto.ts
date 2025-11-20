import { StaffShift } from "src/users/domain/enum/staff-shift.enum";

export class UpdateStaffDto {
    readonly shift?: StaffShift;
    readonly handledOrders?: number;
}
