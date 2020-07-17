import { Routes } from '@angular/router';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';

export const InvoiceRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'invoice',
        component: InvoiceListComponent
      },
    ]
  }
];
