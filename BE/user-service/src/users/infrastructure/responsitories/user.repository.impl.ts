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

    // save user (create or update)
    async save(user: UserEntity): Promise<UserEntity> {
        try {
            // map entity to schema object for persistence
            const userObj = UserMapper.toUserPersistence(user); 
            // save or update user
            await this.userModel.updateOne({ ID: user.ID }, userObj, { upsert: true });

            // If user is of type Delivery, save delivery details 
            if (user.userType === UserType.DELIVERY && user.getDeliveryDetail()) {
                const deliveryObj = UserMapper.toDeliveryPersistence(user.getDeliveryDetail(), user.ID); 
                await this.deliveryModel.updateOne({ user: user.ID }, deliveryObj, { upsert: true });
            }

            return user;

        } catch (error) {
            throw new Error(`Error saving user: ${error.message}`);
        }
    }

    // private helper to find one user by filter
    private async findOneByFilter(filter: Partial<{ ID: string; email: string; userType: UserType; }>): Promise<UserEntity | null> {
        try {
            const userDoc = await this.userModel.findOne(filter).exec();
            if (!userDoc) return null;

            let deliveryDoc: DeliveryDetailDocument | null = null;
            if (userDoc.userType === UserType.DELIVERY) {
                deliveryDoc = await this.deliveryModel.findOne({ user: userDoc.ID }).exec();
            }

            return UserMapper.toEntity(userDoc, deliveryDoc);
        } catch (error) {
            throw new Error(`Error finding user by filter ${JSON.stringify(filter)}: ${error.message}`);
        }
    }

    async findById(id: string): Promise<UserEntity | null> {
        return this.findOneByFilter({ ID: id });
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        return this.findOneByFilter({ email });
    }

    async findAll(): Promise<UserEntity[]> {
        try {
            const userDocs = await this.userModel.find().exec();
            const deliveryDocs = await this.deliveryModel.find().exec();

            const deliveryMap = new Map(deliveryDocs.map(d => [d.user.toString(), d]));
            return userDocs.map(userDoc => {
                const deliveryDoc = deliveryMap.get(userDoc.ID);
                return UserMapper.toEntity(userDoc, deliveryDoc);
            });

        } catch (error) {
            throw new Error(`Error finding all users: ${error.message}`);
        }
    }
    
    async remove(id: string): Promise<void> {
        try {
            await this.userModel.deleteOne({ ID: id }).exec();
            await this.deliveryModel.deleteOne({ user: id }).exec();
        } catch (error) {
            throw new Error(`Error removing user with ID ${id}: ${error.message}`);
        }
    }
    
}