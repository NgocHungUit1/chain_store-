import { Routes } from '@angular/router';
import {SupplierListComponent} from '../supplier/supplier-list/supplier-list.component';

export const PartnerRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'supplier',
        loadChildren: () => import('../supplier/supplier.module').then(m => m.SupplierModule)
      },
      {
        path: 'customer',
        loadChildren: () => import('../customer/customer.module').then(m => m.CustomerModule)
      },
      {
        path: 'doctor',
        loadChildren: () => import('../doctor/doctor.module').then(m => m.DoctorModule)
      },
    ]
  }
];
