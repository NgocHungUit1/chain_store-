import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicineModule } from '../medicine/medicine.module';
import { ProductModule } from '../product/product.module';
import { PartnerRoutes } from './partner.routing';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(PartnerRoutes),
    MedicineModule,
    ProductModule
  ]
})
export class PartnerModule { }
