export interface QualityCheck {
  id: number;
  no: string;
  title: string;
  date: string;
  reason: string;
  note: string;
  status: number;
  store_id: number;
  branch_id: number;
  created_at: number;
  updated_at: number;
  created_by: number;
  updated_by: number;
  deleted: number;
}

export interface QualityCheckResponse {
  data: QualityCheck[];
  total: number;
}

export interface QualityCheckFilter {
  page?: number;
  pageSize?: number;
  sort?: string;
  'QualityCheckSearch[date_from]'?: string;
  'QualityCheckSearch[date_to]'?: string;
  'QualityCheckSearch[status]'?: number;
}

export enum QualityCheckStatus {
  COMPLETED = 10,
  PENDING = 9
}

export interface QualityCheckDetail {
  id?: number;
  quality_check_id?: number;
  product_id: number;
  warehouse_product_parcel_id: string;
  parcel_no: string;
  expiration_date: string;
  quantity: number;
  result: number;
  note: string;
  quality_comment: string;
  quality_classification: string;
  product_info?: {
    id: number;
    product_no: string;
    product_name: string;
    base_unit: string;
  };
  parcel_info?: {
    id: string;
    parcel_no: string;
    expiration_date: string;
    quantity_of_stock: string;
  };
  result_text?: string;
}

export interface QualityCheckDetail {
  id: number;
  no: string;
  date: string;
  reason: string;
  note: string;
  status: number;
  details: QualityCheckDetail[];
}

export interface QualityCheckUpdatePayload {
  no: string;
  date: string;
  reason: string;
  note: string;
  status: number;
  details: QualityCheckDetail[];
}
