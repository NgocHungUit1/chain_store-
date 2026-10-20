import {Notification} from './notification.model';

/** Màu nền icon theo loại thông báo (class có sẵn trong theme header) */
export const NOTIFICATION_CLASS = {
  'contract_expired_alert': 'round-danger',
  'contract_nearly_alert': 'round-warning',
  'lower_stock': 'round-warning',
  'expired': 'round-danger',
};

export const NOTIFICATION_ICON = {
  'contract_expired_alert': 'priority_high',
  'contract_nearly_alert': 'running_with_errors',
  'lower_stock': 'inventory_2',
  'expired': 'event_busy',
};

/**
 * Trang cần mở khi bấm vào thông báo; null = không điều hướng.
 * Dùng chung cho chuông ở header và trang Cài đặt > Thông báo.
 */
export function notificationLink(notification: Notification): string | null {
  if (!notification) {
    return null;
  }
  switch (notification.notification_type) {
    case 'lower_stock':
      return '/store/product?quota_stock=lower';
    case 'expired': {
      let timeSelect = 'next_3_month';
      try {
        const detail = notification.obj_detail ? JSON.parse(notification.obj_detail) : null;
        timeSelect = detail?.time_select || timeSelect;
      } catch (e) {
      }
      return '/report/product-report/expiration-date?WarehouseProductParcelSearch[timeSelect]=' + timeSelect;
    }
    default:
      return null;
  }
}
