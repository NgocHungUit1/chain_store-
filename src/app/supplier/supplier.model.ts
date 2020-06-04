import {ApiFilterBase} from "../shared/base";

export class Supplier {
  id: string;
  name: string;
  company_name: string;
  phone_number: string;
  email: string;
  tax_code: string;
  branch_id: number;
  status: string;
}


export class SupplierFilter extends ApiFilterBase{
  id = '';
  name = '';
  company_name = '';
  phone_number = '';
  email = '';
  tax_code = '';
  branch_id = '';
  status = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'SupplierSearch';
  }

}
