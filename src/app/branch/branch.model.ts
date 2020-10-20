import { ApiFilterBase } from '../shared/base';
import { Location } from '../location/location.model';

export class Branch {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  pharmacy_registration_number: string;
  business_registration_certificate: string;
  pharmacy_type: string;
  representative_name: string;
  representative_certificate_number: string;
  representative_phone: string;
  responsible_person_name: string;
  practicing_certificate_no: string;
  professional_qualification: string;
  responsible_person_phone_number: string;
  responsible_person_email: string;
  status: string;
  address: string;
  province: Location;
  district: Location;
  ward: Location;
}


export class BranchFilter extends ApiFilterBase {
  id = '';
  name = '';
  phone_number = '';
  sub_phone_number = '';
  email = '';
  pharmacy_registration_number = '';
  business_registration_certificate = '';
  pharmacy_type = '';
  representative_name = '';
  representative_certificate_number = '';
  representative_phone = '';
  responsible_person_name = '';
  practicing_certificate_no = '';
  professional_qualification = '';
  responsible_person_phone_number = '';
  responsible_person_email = '';
  status = '';
  address = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'BranchSearch';
  }

}
