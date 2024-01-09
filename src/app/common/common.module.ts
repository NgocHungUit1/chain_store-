import {NgModule} from '@angular/core';
import {CommonModule as AngularCommonModule} from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {RouterModule} from '@angular/router';
import {MatMenuModule} from '@angular/material/menu';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSidenavModule} from '@angular/material/sidenav';
import {NgxExtendedPdfViewerModule} from 'ngx-extended-pdf-viewer';
import {ModelChangeLogComponent} from './model-change-log/model-change-log.component';
import {MatCardModule} from '@angular/material/card';

@NgModule({
  declarations: [
    ModelChangeLogComponent
  ],
  imports: [
    AngularCommonModule,
    MatSelectModule,
    MatOptionModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatInputModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatPaginatorModule,
    MatDialogModule,
    FlexLayoutModule,
    MatDatepickerModule,
    RouterModule,
    MatSidenavModule,
    NgxExtendedPdfViewerModule,
    MatCardModule,
    FormsModule
  ],
  exports: [
    ModelChangeLogComponent
  ],
  entryComponents: [
  ]
})
export class CommonModule {
}
