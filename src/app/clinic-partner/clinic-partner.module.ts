import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {DemoMaterialModule} from '../demo-material-module';
import {ClinicPartnerListComponent} from './clinic-partner-list.component';
import {ClinicPartnerDetailComponent} from './clinic-partner-detail.component';
import {ClinicPartnerFormDialogComponent} from './clinic-partner-form-dialog.component';
import {ClinicPartnerApproveDialogComponent} from './clinic-partner-approve-dialog.component';
import {ClinicPartnerActionDialogComponent} from './clinic-partner-action-dialog.component';
import {ClinicPartnerCredentialsDialogComponent} from './clinic-partner-credentials-dialog.component';

/** Chuỗi › Phòng khám đối tác (pharma_chain/tools/de-xuat/phong-kham-doi-tac.html, Phần 1) */
@NgModule({
  declarations: [ClinicPartnerListComponent, ClinicPartnerDetailComponent, ClinicPartnerFormDialogComponent,
    ClinicPartnerApproveDialogComponent, ClinicPartnerActionDialogComponent, ClinicPartnerCredentialsDialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    DemoMaterialModule,
    RouterModule.forChild([
      {path: '', component: ClinicPartnerListComponent},
      {path: ':id', component: ClinicPartnerDetailComponent},
    ]),
  ]
})
export class ClinicPartnerModule {
}
