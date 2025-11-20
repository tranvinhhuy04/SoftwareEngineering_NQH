import { Available } from "src/users/domain/enum/delivery-available.enum";
import { Vehicle } from "src/users/domain/enum/delivery-vehicle.enum";
import { CreateUserDto } from "../user/create-user.dto";

export class CreateDeliveryProfileDto {
        readonly user?: CreateUserDto; 
        readonly available: Available;
        readonly vehicle_info: Vehicle;
}
