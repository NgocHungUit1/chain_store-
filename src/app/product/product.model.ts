import { ApiFilterBase } from '../shared/base';
import { Medicine } from '../medicine/medicine.model';
import { Group } from './group.model';
import { Placement } from './placement.model';

export class ProductUnit {
  id: number;
  product_id: number;
  name: string;
  value: number;
  sell_price: number;
  no: string;
  is_base: string;
  original_price: number;
  quantity_of_stock: number;
  latest_parcel_no: string;
  latest_parcel_exp_date: string;
}

export class Product {
  id: string;
  product_no: string;
  barcode: string;
  product_name: string;
  default_image: string;
  original_price: number;
  sell_price: number;
  weight: number;
  quantity_of_stock: number;
  min_quantity: number;
  max_quantity: number;
  base_unit: string;
  description: string;
  status: string;
  product_type: string;
  note: string;
  medicine: Medicine;
  group: Group;
  productPlacements: Placement[];
  productUnits: ProductUnit[];
  images: object[];
  common: object;  // use for sale page
  note_detail_sale: string; // use for sale page
  discount: string; // use for setup price detail
  discount_type: string; // use for setup price detail
  end_price: string; // use for setup price detail
  stt: number; // for view
  product_unit_id: number; // for unit
  product_unit_value: number; //for unit
  product_unit_quantity_of_stock: number; //for unit
  amount: number;
  quantity: Quantity;
}

export class Quantity {
  id: string;
  product_id: string;
  branch_id: string;
  store_id: string;
  number: number;
}


export class ProductFilter extends ApiFilterBase {
  id = '';
  product_no = '';
  barcode = '';
  product_name = '';
  original_price = '';
  sell_price = '';
  weight = '';
  quantity_of_stock = '';
  base_unit = '';
  status = '';
  page = 1;
  pageSize = 15;
  sort = '';
  price_book_id = '';
  keyword = '';
  product_type = '';
  date_from = '';
  date_to = '';
  export = false;
  type_report = '';
  group_id = '';

  getModelSearch() {
    return 'ProductSearch';
  }

}


export class ProductReport {
  id: string;
  product_no: string;
  barcode: string;
  product_name: string;
  default_image: string;
  original_price: number;
  sell_price: number;
  weight: number;
  quantity_of_stock: number;
  min_quantity: number;
  max_quantity: number;
  base_unit: string;
  description: string;
  status: string;
  product_type: string;
  note: string;
  medicine: Medicine;
  group: Group;
  productPlacements: Placement[];
  productUnits: ProductUnit[];
  images: object[];
  common: object;  // use for sale page
  note_detail_sale: string; // use for sale page
  discount: string; // use for setup price detail
  discount_type: string; // use for setup price detail
  end_price: string; // use for setup price detail
  stt: number; // for view
  product_unit_id: number; // for unit
  product_unit_value: number; //for unit
  product_unit_quantity_of_stock: number; //for unit
  amount: number;
  quantity: Quantity;
  sl_ban: number;
  doanh_thu: number;
  sl_tra: number;
  gia_tri_tra: number;
  doanh_thu_thuan: number;
  tong_gia_vo: number;
  loi_nhuan: number;
  ty_suat: number;
  product: Product;
}

export class Option {
  so_luong: number;
  in_ma: string;
  in_gia: string;
  in_vnd: string;
  in_don_vi: string;
  in_ten_cua_hang: string;
}
