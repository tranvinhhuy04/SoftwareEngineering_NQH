import { UserActive } from "../../enum/user-active.enum";
import { UserType } from "../../enum/user-type.enum";

export class UpdateUserDto {
    readonly ID?: string;
    readonly name?: string;
    readonly email?: string;
    readonly password?: string;
    readonly phone?: string
    readonly address?: string
    readonly userType?: UserType
    readonly active?: UserActive
}
