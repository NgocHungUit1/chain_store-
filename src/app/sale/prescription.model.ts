import { ApiFilterBase } from '../shared/base';

export class Prescription {
  id: string;
  no: string;
  medical_facility: any;
  doctor_id: any;
  name: string;
  patient: string;
  age: string;
  weight: string;
  cmnd: string;
  bhyt: string;
  person: string;
  phone: string;
  sex: number;
  note: string;
  status: string;
  address: string;
  doctor: any;
  medicalFacility: any;
}


export class PrescriptionFilter extends ApiFilterBase {
  id = '';
  name = '';
  no = '';
  phone = '';
  sex = '';
  email = '';
  note = '';
  address = '';
  status = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'PrescriptionSearch';
  }

}
