import {ApiFilterBase} from "../shared/base";

export class Medicine {
  id: string;
  medicine_no: string;
  medicine_name: string;
  registration_no: string;
  main_active_substance: string;
  content: string;
  packing: string;
  manufacturer: string;
  made_in: string;
  unit: string;
  /** Mã định danh thuốc trên CSDL Dược quốc gia, đồng bộ theo số GPLH */
  national_drug_id: string;
}


export class MedicineFilter extends ApiFilterBase{
  id = '';
  medicine_no = '';
  medicine_name = '';
  registration_no = '';
  main_active_substance = '';
  content = '';
  packing = '';
  manufacturer = '';
  made_in = '';
  unit = '';
  page = 1;
  pageSize = 15;
  sort = '';
  keyword = '';

  getModelSearch() {
    return 'MedicineSearch';
  }

}
