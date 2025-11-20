import { UserActive } from "src/users/domain/enum/user-active.enum";
import { UserType } from "src/users/domain/enum/user-type.enum";
import { UpdateDeliveryProfileDto } from "../delivery/update-deliveryDetail.dto";
import { UpdateStaffDto } from "../staff/update-staff.dto";
import { UpdateCustomerDto } from "../customer/update-customer.dto";

export class UpdateUserDto {
    readonly ID: string;
    readonly name?: string;
    readonly email?: string;
    readonly password?: string;
    readonly phone?: string
    readonly address?: string
    readonly userType?: UserType
    readonly active?: UserActive
    readonly avatar?: string
    readonly deliveryProfile?: UpdateDeliveryProfileDto
    readonly staffProfile?: UpdateStaffDto
    readonly customerProfile?: UpdateCustomerDto
}
