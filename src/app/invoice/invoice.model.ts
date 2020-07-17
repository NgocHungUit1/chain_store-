import { ApiFilterBase } from "../shared/base";

export class Invoice {
  id: string;
  invoice_no: string;
  customer_id: string;
  discount: string;
  discount_type: string;
  note: string;
  price_book_id: string;
}

export class InvoiceFilter extends ApiFilterBase {
  id = '';
  invoice_no = '';
  customer_id = '';
  discount = '';
  discount_type = '';
  note = '';
  price_book_id = '';
  status = '';
  page = 1;
  pageSize = 15;
  sort = '';

  getModelSearch() {
    return 'InvoiceSearch';
  }

}
