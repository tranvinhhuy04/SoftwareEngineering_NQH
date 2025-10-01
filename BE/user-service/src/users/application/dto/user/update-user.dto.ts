import { UserActive } from "src/users/domain/enum/user-active.enum";
import { UserType } from "src/users/domain/enum/user-type.enum";
import { UpdateDeliveryDetailDto } from "../delivery-detail/update-deliveryDetail.dto";

export class UpdateUserDto {
    readonly ID: string;
    readonly name?: string;
    readonly email?: string;
    readonly password?: string;
    readonly phone?: string
    readonly address?: string
    readonly userType?: UserType
    readonly active?: UserActive
    readonly deliveryDetail?: UpdateDeliveryDetailDto
}
