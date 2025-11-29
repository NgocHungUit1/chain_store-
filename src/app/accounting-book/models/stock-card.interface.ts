export interface StockCard {
  id: number;
  store_id: number;
  product_id: number;
  no: string;
  date: string;
  method: 'import' | 'sale' | 'return' | 'warehouse-return';
  quantity: number;
  quantity_of_stock: number;
  created_at: number;
  updated_at: number;
  created_by: number;
  updated_by: number;
  branch_id: number;
  parent_id: number;
  parcel_no: string;
}

export interface StockCardFilter {
  product_id: number;
  date_from?: string;
  date_to?: string;
  parcel_no?: string;
}

export interface OpeningBalance {
  quantity: number;
  value: number;
}

export interface StockCardSummary {
  total_import_quantity: number;
  total_import_value: number;
  total_export_quantity: number;
  total_export_value: number;
  closing_balance_quantity: number;
  closing_balance_value: number;
}
