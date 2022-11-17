import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GroupListComponent } from './group-list/group-list.component';
import { GroupReportComponent } from './group-report/group-report.component';

const routes: Routes = [
  {
    path: '',
    component: GroupListComponent
  },
  {
    path: 'report',
    component: GroupReportComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupRoutingModule { }
