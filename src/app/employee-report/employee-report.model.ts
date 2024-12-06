import { ApiFilterBase } from '../shared/base';
import { Location } from '../location/location.model';
import { User } from '../user/user.model';

export class EmployeeReport {
  id: string;
  name: string;
  user_name: string;
  sex: number;
  phone_number: string;
  total_revenue: number;
  total_return: number;
  total_sale: number;
  total_profit: number;
  total_commission: number;
}
