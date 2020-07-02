import { Product } from '../product/product.model';

export class Detail {
    product: Product;
    amount: string;
    total: string;
    price: string;
    discount: string;
    discount_type: string;
    note: string;
}
export class Order {
    order_detail: Detail[];
    pricebook_id: string;
    customer_id: string;
    total: string;
    price: string;
    discount: string;
    discount_type: string;
    note: string;
}