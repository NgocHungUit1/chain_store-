export interface Product {
  id: number;
  product_no: string;
  product_name: string;
  base_unit: string;
  sell_price: number;
  original_price: number;
  status: number;
}

export interface ProductSearchFilter {
  keyword: string;
  stock?: string;
  quota_stock?: string;
  status?: string;
  product_type?: string;
}
