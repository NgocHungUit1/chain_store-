import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsMainComponent } from './settings-main/settings-main.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { QuillModule } from 'ngx-quill';
import { DragulaModule } from 'ng2-dragula';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { DemoMaterialModule } from '../demo-material-module';
import { SettingsRoutes } from './settings.routing';
import {SettingProfileComponent} from './setting-profile/setting-profile.component';
import {NotificationListComponent} from './notification-list/notification-list.component';
import {SettingSidenavComponent} from './setting-sidenav/setting-sidenav.component';
import {SettingStoreComponent} from './setting-store/setting-store.component';

@NgModule({
  declarations: [
    SettingsMainComponent,
    SettingProfileComponent,
    NotificationListComponent,
    SettingSidenavComponent,
    SettingStoreComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(SettingsRoutes),
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
export class SettingsModule {
}
