import { UserType } from "src/users/domain/enum/user-type.enum";
import { UserActive } from "src/users/domain/enum/user-active.enum";
import { CreateDeliveryProfileDto } from "../delivery/create-deliveryDetail.dto";
import { CreateStaffDto } from "../staff/create-staff.dto";
import { CreateCustomerDto } from "../customer/create-customer.dto";

export class CreateUserDto {
    readonly name: string;
    readonly email: string;
    readonly password: string;
    readonly phone: string;
    readonly address: string;
    readonly userType: UserType
    readonly active: UserActive
    readonly avatar?: string
    readonly deliveryProfile?: CreateDeliveryProfileDto
    readonly staffProfile?: CreateStaffDto
    readonly customerProfile?: CreateCustomerDto
}
