import { StaffShift } from "src/users/domain/enum/staff-shift.enum";
import { CreateUserDto } from "../user/create-user.dto";

export class CreateStaffDto {
    readonly user?: CreateUserDto; 
    readonly shift?: StaffShift;
    readonly isActive?: boolean;
    readonly handledOrders?: number;
}
