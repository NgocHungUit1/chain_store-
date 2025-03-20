import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FollowBookQualityControlComponent } from './follow-book-quality-control/follow-book-quality-control.component';
import { RouterModule } from '@angular/router';
import { FollowBookRoutes } from './follow-book.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { QuillModule } from 'ngx-quill';
import { DragulaModule } from 'ng2-dragula';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { DemoMaterialModule } from '../demo-material-module';

@NgModule({
  declarations: [
    FollowBookQualityControlComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(FollowBookRoutes),
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
export class FollowBookModule { }
