import { ApiFilterBase } from '../shared/base';

export class Placement {
  id: number;
  store_id: number;
  name: string;
  description: string;
  status: string;
}


export class PlacementFilter extends ApiFilterBase {
  id = '';
  name = '';
  store_id = 0;
  description = '';
  status = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'PlacementSearch';
  }

}
