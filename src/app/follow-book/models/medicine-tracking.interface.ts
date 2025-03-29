export interface MedicineTrackingProduct {
  id: number;
  product_name: string;
  product_no: string;
}

export interface MedicineTrackingDetail {
  id: number;
  invoice_id: number;
  product_id: number;
  amount: number;
  base_unit: string;
  product: MedicineTrackingProduct;
}

export interface MedicineTrackingResponse {
  id: number;
  invoice_no: string;
  created_at: number;
  createdFormat: string;
  invoiceDetails: MedicineTrackingDetail[];
}

export interface MedicineTrackingFilter {
  page: number;
  pageSize: number;
  expand: string;
  search_string?: string;
  date_from?: string;
  date_to?: string;
  has_prescription?: boolean;
}
