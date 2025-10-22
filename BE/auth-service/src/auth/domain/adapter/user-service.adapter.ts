export interface IUserServiceAdapter {
  createUser(data: any): Promise<any>;
  getUserById(userId: string): Promise<any>;
}
