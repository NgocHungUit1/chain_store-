export interface QualityControlDetail {
  product_id: number;
  warehouse_product_parcel_id: string;
  parcel_no: string;
  expiration_date: string;
  quantity: number;
  result: number;
  note: string;
  quality_comment: string;
  quality_classification: string;
}

export interface QualityControlRequest {
  no: string;
  date: string;
  reason: string;
  note: string;
  status: number;
  details: QualityControlDetail[];
}
