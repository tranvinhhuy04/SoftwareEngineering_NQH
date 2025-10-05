import { Available } from "src/users/domain/enum/delivery-available.enum";
import { Vehicle } from "src/users/domain/enum/delivery-vehicle.enum";

export class UpdateDeliveryDetailDto {
        readonly available?: Available;
        readonly vehicle_info?: Vehicle;
}
