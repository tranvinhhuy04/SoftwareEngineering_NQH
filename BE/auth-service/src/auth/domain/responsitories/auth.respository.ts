export interface AuthRepository {
    registerUser(email: string, passwordHash: string): Promise<string>;
    loginUser(email: string, password: string): Promise<string>;
    logoutUser(userId: string): Promise<void>;
}