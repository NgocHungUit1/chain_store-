import { ApiFilterBase } from "../shared/base";

export class Manufacturer {
  id: number;
  name: string;
  description: string;
  status: string;
}


export class ManufacturerFilter extends ApiFilterBase {
  id = '';
  name = '';
  description = '';
  status = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'ManufacturerSearch';
  }

}
