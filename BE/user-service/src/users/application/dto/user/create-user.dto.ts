import { UserType } from "src/users/domain/enum/user-type.enum";
import { UserActive } from "src/users/domain/enum/user-active.enum";
import { CreateDeliveryDetailDto } from "../delivery-detail/create-deliveryDetail.dto";

export class CreateUserDto {
    readonly name: string;
    readonly email: string;
    readonly password: string;
    readonly phone: string
    readonly address: string
    readonly userType: UserType
    readonly active: UserActive
    readonly deliveryDetail?: CreateDeliveryDetailDto
}
