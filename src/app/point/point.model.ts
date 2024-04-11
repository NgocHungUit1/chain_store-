import { ApiFilterBase } from '../shared/base';

export class Point {
  id: string;
  store_id: number;
  branch_id: number;
  customer_id: number;
  invoice_id: number;
  point: number;
  old_total_point: number;
  new_total_point: number;
}

export class PointFilter extends ApiFilterBase {
  customer_id = '';

  getModelSearch() {
    return 'PointSearch';
  }
}
