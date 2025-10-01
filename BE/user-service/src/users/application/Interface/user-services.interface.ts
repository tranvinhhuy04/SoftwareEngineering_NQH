import { CreateUserDto } from "src/users/application/dto/user/create-user.dto";
import { DeliveryDetail } from "../../infrastructure/database/deliveryDetail.schema";
import { User } from "../../infrastructure/database/user.schema";
import { UpdateUserDto } from "src/users/application/dto/user/update-user.dto";
import { UpdateDeliveryDetailDto } from "src/users/application/dto/delivery-detail/update-deliveryDetail.dto";

export interface IUserService {
    // CRUD cơ bản
    create(createUserDto: CreateUserDto): Promise<User>;
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    updateDeliveryDetail(id: string, updateDeliveryDetailDto: UpdateDeliveryDetailDto): Promise<DeliveryDetail>;
    remove(id: string): Promise<User>;   

    // Truy vấn user
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByPhone(phone: string): Promise<User | null>;

    // Truy vấn nâng cao
    findByUserType(userType: string): Promise<User[]>;
    findByStatus(active: string): Promise<User[]>;
    findByVehicle(vehicleInfo: string): Promise<User[]>;

    // Hỗ trợ quản trị
    search(keyword: string): Promise<User[]>;
    paginate(page: number, limit: number): Promise<{ data: User[]; total: number }>;

    // Delivery detail
    getDeliveryDetailByUserId(userId: string): Promise<DeliveryDetail | null>;
}
