import { Routes } from '@angular/router';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';

export const InvoiceRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'invoice',
        component: InvoiceListComponent,
      },
      {
        // Mở đúng một hoá đơn theo mã, dùng khi bấm số chứng từ ở tab Thẻ kho.
        // loadData() thấy param 'code' thì lọc theo invoice_no và BỎ ràng buộc thời gian,
        // nhờ vậy đơn cũ hơn 3 tháng vẫn hiện ra.
        path: 'invoice/:code',
        component: InvoiceListComponent,
      },
    ]
  }
];
