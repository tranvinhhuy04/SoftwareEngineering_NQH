import { Injectable } from "@nestjs/common";
import { UserEntity } from "src/users/domain/entities/user.entity";
import { IUserRepository } from "src/users/domain/responsitories/user.repository";
import { UserMapper } from "../mappers/user.mapper";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "../database/user.schema";
import { Model } from "mongoose";
import { DeliveryDetail, DeliveryDetailDocument } from "../database/deliveryDetail.schema";
import { UserType } from "src/users/domain/enum/user-type.enum";

@Injectable()
export class UserRepositoryImpl implements IUserRepository{
    constructor( 
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>, 

        @InjectModel(DeliveryDetail.name) 
        private readonly deliveryModel: Model<DeliveryDetailDocument> 
    ) {}
    async save(user: UserEntity): Promise<UserEntity> {
        try {
            // Chuyển Entity -> object MongoDB
            const userObj = UserMapper.toPersistence(user); 
            // Lưu hoặc update user
            await this.userModel.updateOne({ ID: user.ID }, userObj, { upsert: true });

            // Nếu là Delivery, lưu thông tin chi tiết giao hàng
            if (user.userType === UserType.DELIVERY && user.getDeliveryDetail()) {
                const deliveryObj = UserMapper.toDeliveryPersistence(user.getDeliveryDetail(), user.ID); 
                await this.deliveryModel.updateOne({ user: user.ID }, deliveryObj, { upsert: true });
            }

            return user;

        } catch (error) {
            throw new Error(`Error saving user: ${error.message}`);
        }
    }


    findById(id: string): Promise<UserEntity | null> {
        throw new Error("Method not implemented.");
    }
    findByEmail(email: string): Promise<UserEntity | null> {
        throw new Error("Method not implemented.");
    }
    findAll(): Promise<UserEntity[]> {
        throw new Error("Method not implemented.");
    }
    remove(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
}