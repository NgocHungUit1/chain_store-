import { ApiFilterBase } from "../shared/base";
import { Medicine } from "../medicine/medicine.model";
import { Group } from "./group.model";
import { Placement } from "./placement.model";

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
  productUnits: object[];
  images: object[];
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

  getModelSearch() {
    return 'ProductSearch';
  }

}
