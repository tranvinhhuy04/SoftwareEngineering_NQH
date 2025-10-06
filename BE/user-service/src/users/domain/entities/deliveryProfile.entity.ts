import { Types } from "mongoose";
import { Available } from "../enum/delivery-available.enum";
import { Vehicle } from "../enum/delivery-vehicle.enum";

export class DeliveryProfileEntity{
    constructor(
        public readonly ID: string,
        public user: Types.ObjectId, 
        public available: Available,
        public vehicle_info: Vehicle,
        private readonly _id?: Types.ObjectId,

    ){}

    get_Id() { return this._id;}
}

