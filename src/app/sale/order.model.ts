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
  sample_prescription_id: string;
  product: Product;
  amount: number;
  common_price: number;
  product_unit_id: number;
  product_unit_value: number;
  base_unit: string;

  is_return: boolean;
  max_amount_return: number;
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
  is_return: boolean;
  branch_id: number;
  created_at: string;
  today: string;
  time: string;
  prescription_id: string;
  new: boolean;
  total_amount: number;
  national_pharmacy_no: string;
}

export class ListInvoice {
  itemInvoice: ItemInvoice[] = [];
}

export class ItemDetail {
  amount: string;
  price: number;
  total: number;
  product: Product;
  product_unit_id: number;
  product_unit_value: number;
  base_unit: string;
  so_lo: string;
}

export class ResInvoicePrint {
  invoice_name: string;
  invoice_no: string;
  active: boolean;
  price_book_id: string;
  customer: Customer;
  created_at: string;
  store: any;
  detail: ItemDetail[];
  total: string;
  total_price: string; // tong tien hang
  discount: string;
  sum_payment: string; // tong thanh tona
  debt: string; // no
  nationalPrescription: NationalPrescription;
}

export class ResReturnsPrint {
  return_name: string;
  return_no: string;
  active: boolean;
  price_book_id: string;
  customer: Customer;
  created_at: string;
  store: any;
  detail: ItemDetail[];
  total: string;
  total_price: string; // tong tien hang
  discount: string;
}

export class NationalPrescription {
  nationalPrescriptionId: string;
  patientName: string;
  patientDOB: string;
  patientPhoneNumber: string;
  patientAddress: string;
  patientSex: string;
  patientWeight: number;
  patientMedicalId: string;
  patientMedicalInsuranceId: string;
  guardianName: string;
  medicalFacilityName: string;
  medicalFacilityPhoneNumber: string;
  doctorName: string;
  doctorNote: string;
  doctorAdvice: string;
  diagnostics: NationalDiagnostic[];
  products: NationalProduct[];
  prescriptionDate: string;
}

export class NationalDiagnostic {
  id: string;
  name: string;
  conclusion: string;
}

export class NationalProduct {
  id: string;
  name: string;
  unit: string;
  amount: number;
  usage: string;
}
