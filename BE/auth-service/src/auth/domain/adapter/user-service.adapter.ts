export interface IUserServiceAdapter {
  createUser(data: any): Promise<any>;
}
