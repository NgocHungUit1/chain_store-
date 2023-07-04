import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UserListComponent} from './user-list/user-list.component';
import {UserFormDialogComponent} from './user-form-dialog/user-form-dialog.component';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {QuillModule} from 'ngx-quill';
import {DragulaModule} from 'ng2-dragula';
import {PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {Ng2SearchPipeModule} from 'ng2-search-filter';
import {DemoMaterialModule} from '../demo-material-module';
import {UserRoutes} from './user.routing';
import {UserTabInfoComponent} from './user-tab-info/user-tab-info.component';
import {UserPopupDeleteDialogComponent} from './user-popup-delete-dialog/user-popup-delete-dialog.component';
import {UserTabAuthorizationComponent} from './user-tab-authorization/user-tab-authorization.component';
import {TreeViewModule} from '@syncfusion/ej2-angular-navigations';
import {StoreRoleFormDialogComponent} from './store-role-form-dialog/store-role-form-dialog.component';


@NgModule({
  declarations: [
    UserListComponent,
    UserFormDialogComponent,
    UserTabInfoComponent,
    UserPopupDeleteDialogComponent,
    UserTabAuthorizationComponent,
    StoreRoleFormDialogComponent
  ],
    imports: [
        CommonModule,
        RouterModule.forChild(UserRoutes),
        FormsModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        QuillModule.forRoot(),
        DragulaModule.forRoot(),
        PerfectScrollbarModule,
        Ng2SearchPipeModule,
        DemoMaterialModule,
        TreeViewModule
    ]
})
export class UserModule {
}
