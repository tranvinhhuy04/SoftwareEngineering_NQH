import { User } from "src/users/database/user.schema";
import { Available } from "src/users/enum/delivery-available.enum";
import { Vehicle } from "src/users/enum/delivery-vehicle.enum";

export class UpdateDeliveryDetailDto {
        readonly ID?: string;
        readonly user?: User; 
        readonly available?: Available;
        readonly vehicle_info?: Vehicle;
}
