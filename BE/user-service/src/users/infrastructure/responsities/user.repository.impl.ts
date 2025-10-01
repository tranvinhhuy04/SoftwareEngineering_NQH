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

    // find user by id
    async findById(id: string): Promise<UserEntity | null> {
        try {
            const userDoc = await this.userModel.findOne({ ID: id }).exec();
            if (userDoc) {
                let deliveryDoc: DeliveryDetailDocument | null = null;
                if (userDoc.userType === UserType.DELIVERY) {
                    deliveryDoc = await this.deliveryModel.findOne({ user: userDoc.ID }).exec();
                }
                return UserMapper.toEntity(userDoc, deliveryDoc);
            }
            return null;
        } catch (error) {
            throw new Error(`Error finding user by ID: ${error.message}`);
        }
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        try {
            const userDoc = await this.userModel.findOne({ email: email }).exec();
            if (userDoc) {
                let deliveryDoc: DeliveryDetailDocument | null = null;
                if (userDoc.userType === UserType.DELIVERY) {
                    deliveryDoc = await this.deliveryModel.findOne({ user: userDoc.ID }).exec();
                }
                return UserMapper.toEntity(userDoc, deliveryDoc);
            }
            return null;
        } catch (error) {
            throw new Error(`Error finding user by ID: ${error.message}`);
        }
    }
    async findAll(): Promise<UserEntity[]> { 
        try { 
            const userDocs = await this.userModel.find().exec(); 
            const deliveryDocs = await this.deliveryModel.find().exec(); 
            return userDocs.map(userDoc => { 
                const deliveryDoc = deliveryDocs.find(delivery => delivery.user.toString() === userDoc.ID);
                 return UserMapper.toEntity(userDoc, deliveryDoc); }); 
                } 
                catch (error) { 
                    throw new Error(`Error finding all users: ${error.message}`);
                }
            }
            
    remove(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
}