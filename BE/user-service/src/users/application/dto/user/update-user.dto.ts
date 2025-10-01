import { UserActive } from "../../domain/enum/user-active.enum";
import { UserType } from "../../domain/enum/user-type.enum";

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
