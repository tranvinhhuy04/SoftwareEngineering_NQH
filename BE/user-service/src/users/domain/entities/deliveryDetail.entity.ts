import { Available } from "../enum/delivery-available.enum";
import { Vehicle } from "../enum/delivery-vehicle.enum";
import { UserEntity } from "./user.entity";

export class DeliveryDetailEntity{
    constructor(
        public readonly id: string,
        public user: UserEntity, 
        public available: Available,
        public vehicle_info: Vehicle,
    ){}
}