import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {DemoMaterialModule} from '../demo-material-module';
import {InventoryTurnoverComponent} from './inventory-turnover.component';

@NgModule({
  declarations: [InventoryTurnoverComponent],
  imports: [
    CommonModule,
    FormsModule,
    DemoMaterialModule,
    RouterModule.forChild([{path: '', component: InventoryTurnoverComponent}]),
  ]
})
export class InventoryTurnoverModule {
}
