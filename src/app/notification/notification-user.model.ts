import {ApiFilterBase} from '../shared/base';
import {Notification} from './notification.model';

export class NotificationUserFilter extends ApiFilterBase {
  id = '';
  user_id = '';
  notification_id = '';
  read_at = 0;
  is_read = 0;
  status = '';
  page = 1;
  pageSize = 20;
  sort = '';
  date_ranger;

  getModelSearch() {
    return 'NotificationUserSearch';
  }

}

export class NotificationUser {
  id: string;
  user_id: number;
  notification_id: number;
  notification: Notification;
  is_read: boolean;
  status: string;
}
