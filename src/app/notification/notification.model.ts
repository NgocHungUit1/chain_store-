import {ApiFilterBase} from '../shared/base';

export class NotificationFilter extends ApiFilterBase {
  id = '';
  notification_type = '';
  title = '';
  description = '';
  detail = '';
  status = '';
  page = 1;
  pageSize = 20;
  sort = '';

  getModelSearch() {
    return 'NotificationSearch';
  }

}

export class Notification {
  id: string;
  notification_type: string;
  title: string;
  description: string;
  detail: string;
  status: string;
  created_at: number;
}
