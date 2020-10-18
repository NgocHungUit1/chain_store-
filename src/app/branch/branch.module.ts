import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BranchListComponent } from './branch-list/branch-list.component';
import { BranchFormDialogComponent } from './branch-form-dialog/branch-form-dialog.component';
import { BranchTabInfoComponent } from './branch-tab-info/branch-tab-info.component';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {QuillModule} from 'ngx-quill';
import {DragulaModule} from 'ng2-dragula';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {Ng2SearchPipeModule} from 'ng2-search-filter';
import {DemoMaterialModule} from '../demo-material-module';
import {BranchRoutes} from './branch.routing';
import { BranchPopupDeleteBranchComponent } from './branch-popup-delete-branch/branch-popup-delete-branch.component';


@NgModule({
  declarations: [
    BranchListComponent,
    BranchFormDialogComponent,
    BranchTabInfoComponent,
    BranchPopupDeleteBranchComponent,
    ],
  imports: [
    CommonModule,
    RouterModule.forChild(BranchRoutes),
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    QuillModule.forRoot(),
    DragulaModule.forRoot(),
    PerfectScrollbarModule,
    Ng2SearchPipeModule,
    DemoMaterialModule
  ]
})
export class BranchModule { }
