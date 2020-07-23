import { Product } from '../product/product.model';

export class Detail {
    product: Product;
    amount: number;
    total: number;
    price: number;
    discount: number;
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

export class DiscountSiderBar {
    number: number;
    type: string;
}

export class PaymentSiderBar {
    number: number;
    type: string;
}

// Cau truc don hang

export class ProductInfo {
    product: Product;
    amount: number;
    common_price: number;
}
export class ItemInvoice {
    invoice_name: string;
    invoice_id: string;
    active: string;
    price_book_id: string;
    customer_id: string;
    listProduct: ProductInfo[];
    discountSiderBar: DiscountSiderBar;
    paymentSiderBar: PaymentSiderBar;
}

export class ListInvoice {
    itemInvoice: ItemInvoice[];
}