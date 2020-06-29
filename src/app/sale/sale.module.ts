import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaleMainComponent } from './sale-main/sale-main.component';
import { RouterModule } from '@angular/router';
import { SaleRoutes } from './sale.routing';


@NgModule({
  declarations: [SaleMainComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(SaleRoutes),
  ]
})
export class SaleModule { }
