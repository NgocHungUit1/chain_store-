import { ApiFilterBase } from '../shared/base';
import { Location } from '../location/location.model';

export class Doctor {
  id: string;
  no: string;
  name: string;
  phone: string;
  sex: number;
  email: string;
  note: string;
  status: string;
  address: string;
  province: Location;
  district: Location;
  ward: Location;
}


export class DoctorFilter extends ApiFilterBase {
  id = '';
  name = '';
  no = '';
  phone = '';
  sex = '';
  email = '';
  note = '';
  address = '';
  status = '';
  keyword = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'DoctorSearch';
  }

}
