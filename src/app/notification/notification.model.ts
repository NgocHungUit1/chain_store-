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
  obj_detail: string; // JSON, vd cảnh báo hạn dùng: {"days":30,"count":2,"time_select":"next_30_day"}
  status: string;
  created_at: number;
}
