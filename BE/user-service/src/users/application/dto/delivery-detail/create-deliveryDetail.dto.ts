import { User } from "src/users/infrastructure/database/user.schema";
import { Available } from "src/users/domain/enum/delivery-available.enum";
import { Vehicle } from "src/users/domain/enum/delivery-vehicle.enum";

export class CreateDeliveryDetailDto {
        readonly ID: string;
        readonly user: string; 
        readonly available: Available;
        readonly vehicle_info: Vehicle;
}
