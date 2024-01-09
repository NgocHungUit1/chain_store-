import {ApiFilterBase} from '../../shared/base';

export class ModelChangeLogFilter extends ApiFilterBase {
  id = '';
  model_name = '';
  model_id = '';
  parent_model_id  = null;
  action_name = '';
  search_text = '';
  created_at  = null;
  created_by  = null;
  change_detail = '';
  page  = 1;
  pageSize  = 20;
  sort  = '';
  date_ranger;

  getModelSearch() {
    return 'ModelChangeLogSearch';
  }

}

export class ModelChangeLog {
  id: string;
  model_name: string;
  model_id: string;
  parent_model_id: number;
  action_name: string;
  search_text: string;
  created_at: number;
  created_by: number;
  change_detail: string;
}
