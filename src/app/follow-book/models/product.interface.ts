export interface Product {
  id: number;
  product_no: string;
  product_name: string;
  base_unit: string;
  quantity?: {
    number: number;
  };
}
