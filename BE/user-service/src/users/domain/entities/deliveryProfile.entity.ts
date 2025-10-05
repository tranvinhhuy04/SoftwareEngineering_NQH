import { Types } from "mongoose";
import { Available } from "../enum/delivery-available.enum";
import { Vehicle } from "../enum/delivery-vehicle.enum";

export class DeliveryProfileEntity{
    constructor(
        private readonly _id: Types.ObjectId,
        public readonly ID: string,
        public user: Types.ObjectId, 
        public available: Available,
        public vehicle_info: Vehicle,
    ){}

    get_Id(): Types.ObjectId {
        return this._id;
    }
}

