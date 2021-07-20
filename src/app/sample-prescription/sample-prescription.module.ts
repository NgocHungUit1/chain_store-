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
import { SamplePrescriptionRoutes } from './sample-prescription.routing';
import { SamplePrescriptionListComponent } from './sample-prescription-list/sample-prescription-list.component';
import { SamplePrescriptionCreateComponent } from './sample-prescription-create/sample-prescription-create.component';
import { SamplePrescriptionInfoTabComponent } from './sample-prescription-info-tab/sample-prescription-info-tab.component';
import {InputSelectAllModule} from '../common/input-select-all/input-select-all.module';


@NgModule({
  declarations: [SamplePrescriptionListComponent, SamplePrescriptionCreateComponent, SamplePrescriptionInfoTabComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(SamplePrescriptionRoutes),
        FormsModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        QuillModule.forRoot(),
        DragulaModule.forRoot(),
        PerfectScrollbarModule,
        Ng2SearchPipeModule,
        DemoMaterialModule,
        InputSelectAllModule,
    ]
})
export class SamplePrescriptionModule {
}
