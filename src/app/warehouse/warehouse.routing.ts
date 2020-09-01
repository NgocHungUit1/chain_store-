import { Routes } from '@angular/router';
import { WarehouseListComponent } from './warehouse-list/warehouse-list.component';
import { WarehouseReturnListComponent } from './warehouse-return-list/warehouse-return-list.component';
import { WarehouseReturnFormComponent } from './warehouse-return-form/warehouse-return-form.component';
import { WarehouseImportFormComponent } from './warehouse-import-form/warehouse-import-form.component';
import { InvoiceListComponent } from '../invoice/invoice-list/invoice-list.component';
import { ReturnsListComponent } from '../returns/returns-list/returns-list.component';


export const WarehouseRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'warehouse',
        component: WarehouseListComponent
      },
      {
        path: 'warehouse/create',
        component: WarehouseImportFormComponent
      },
      {
        path: 'warehouse/update/:id',
        component: WarehouseImportFormComponent
      },
      {
        path: 'warehouse-return',
        component: WarehouseReturnListComponent
      },
      {
        path: 'warehouse-return/create',
        component: WarehouseReturnFormComponent
      },
      {
        path: 'warehouse-return/update/:id',
        component: WarehouseReturnFormComponent
      },
      {
        path: 'invoice',
        component: InvoiceListComponent
      },
      {
        path: 'returns',
        component: ReturnsListComponent
      },
    ]
  }
];
