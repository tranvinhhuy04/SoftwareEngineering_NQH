export class UserQueryHelper {
  static buildBaseQuery(filters: any): Record<string, any> {
  const query: Record<string, any> = {};

  if (filters.name) query.name = { $regex: filters.name, $options: 'i' };
  if (filters.email) query.email = { $regex: filters.email, $options: 'i' };
  if (filters.phone) query.phone = { $regex: filters.phone, $options: 'i' };
  if (filters.address) query.address = { $regex: filters.address, $options: 'i' };
  if (filters.avatar) query.avatar = { $regex: filters.avatar, $options: 'i' };

  if (filters.userType) query.userType = filters.userType.toLowerCase();
  if (filters.active) query.active = filters.active.toLowerCase();

  return query;
}


  static getPagination(filters: any) {
    const pageNum = Number.isInteger(+filters.page) && +filters.page > 0 ? +filters.page : 1;
    const limitNum = Number.isInteger(+filters.limit) && +filters.limit > 0 ? +filters.limit : 10;
    const skip = (pageNum - 1) * limitNum;
    return { pageNum, limitNum, skip };
  }
}
