import { User } from "src/users/infrastructure/database/user.schema";
import { Available } from "src/users/domain/enum/delivery-available.enum";
import { Vehicle } from "src/users/domain/enum/delivery-vehicle.enum";
import { CreateUserDto } from "../user/create-user.dto";

export class CreateDeliveryDetailDto {
        readonly user: CreateUserDto; 
        readonly available: Available;
        readonly vehicle_info: Vehicle;
}
