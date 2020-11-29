import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {QuillModule} from 'ngx-quill';
import {DragulaModule} from 'ng2-dragula';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {Ng2SearchPipeModule} from 'ng2-search-filter';
import {DemoMaterialModule} from '../demo-material-module';
import {ShiftsRoutes} from './shifts.routing';
import { ShiftsFormDialogComponent } from './shifts-form-dialog/shifts-form-dialog.component';
import { ShiftsPopupDeleteDialogComponent } from './shifts-popup-delete-dialog/shifts-popup-delete-dialog.component';

@NgModule({
  declarations: [ShiftsFormDialogComponent, ShiftsPopupDeleteDialogComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(ShiftsRoutes),
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    QuillModule.forRoot(),
    DragulaModule.forRoot(),
    PerfectScrollbarModule,
    Ng2SearchPipeModule,
    DemoMaterialModule,
  ],
  entryComponents: [
    ShiftsFormDialogComponent
  ]
})

export class ShiftsModule { }
