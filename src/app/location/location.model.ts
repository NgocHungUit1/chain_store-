import {ApiFilterBase} from '../shared/base';

export class Location {
  id: number;
  name: string;
  type: string;
  parent_id: number;
}


export class LocationFilter extends ApiFilterBase{
  id = '';
  name = '';
  type = '';
  parent_id = 0;
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'LocationSearch';
  }

}
