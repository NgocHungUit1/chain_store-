import { Customer } from '../customer/customer.model';
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
    product_id: string;
    product: Product;
    amount: number;
    common_price: number;
}
export class ItemInvoice {
    invoice_name: string;
    invoice_id: number;
    active: boolean;
    price_book_id: string;
    customer: Customer;
    user: any;
    listProduct: ProductInfo[];
    discountSiderBar: DiscountSiderBar;
    paymentSiderBar: PaymentSiderBar;
    noteSiderBar: string;
}

export class ListInvoice {
    itemInvoice: ItemInvoice[];
}

export class itemDetail {
    amount: string;
    price: number;
    product: Product;
}

export class resInvoicePrint {
    invoice_name: string;
    invoice_no: string;
    active: boolean;
    price_book_id: string;
    customer: Customer;
    created_at: string;
    store: any;
    detail: itemDetail[];
}

