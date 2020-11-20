import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragulaModule } from 'ng2-dragula';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { QuillModule } from 'ngx-quill';
import { DemoMaterialModule } from '../demo-material-module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { MoveListComponent } from './move-list/move-list.component';
import { MoveRoutes } from './move.routing';
import { MoveCreateComponent } from './move-create/move-create.component';
import { MoveInfoTabComponent } from './move-info-tab/move-info-tab.component';



@NgModule({
  declarations: [MoveListComponent, MoveCreateComponent, MoveInfoTabComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(MoveRoutes),
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    QuillModule.forRoot(),
    DragulaModule.forRoot(),
    PerfectScrollbarModule,
    Ng2SearchPipeModule,
    DemoMaterialModule,
  ]
})
export class MoveModule { }
