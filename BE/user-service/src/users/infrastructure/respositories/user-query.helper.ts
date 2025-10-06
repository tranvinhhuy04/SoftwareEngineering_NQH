export class UserQueryHelper {
  static buildBaseQuery(filters: any): Record<string, any> {
    const query: Record<string, any> = {};
    const { name, email, userType, active } = filters;

    if (name) query.name = { $regex: name, $options: 'i' };
    if (email) query.email = { $regex: email, $options: 'i' };
    if (userType) query.userType = userType;
    if (active) query.active = active;

    return query;
  }

  static getPagination(filters: any) {
    const pageNum = Number.isInteger(+filters.page) && +filters.page > 0 ? +filters.page : 1;
    const limitNum = Number.isInteger(+filters.limit) && +filters.limit > 0 ? +filters.limit : 10;
    const skip = (pageNum - 1) * limitNum;
    return { pageNum, limitNum, skip };
  }
}
