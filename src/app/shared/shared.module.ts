import { NgModule } from '@angular/core';

import { MenuItems } from './menu-items/menu-items';
import {
  AccordionAnchorDirective,
  AccordionLinkDirective,
  AccordionDirective
} from './accordion';
import { IncludesPipe } from './includes.pipe';
import { FilterPipe } from './filter.pipe';
import { PopoverComponent } from './popover/popover.component';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { SlicePipe } from './slice.pipe';
import { SharedEditorComponent } from './shared-editor/shared-editor.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    AccordionAnchorDirective,
    AccordionLinkDirective,
    AccordionDirective,
    IncludesPipe,
    FilterPipe,
    PopoverComponent,
    SlicePipe,
    // shareeditor
    SharedEditorComponent,
    ConfirmationDialogComponent
  ],
  exports: [
    AccordionAnchorDirective,
    AccordionLinkDirective,
    AccordionDirective,
    IncludesPipe,
    PopoverComponent,
    PopoverComponent,
    // share
    SharedEditorComponent,
    ConfirmationDialogComponent
  ],
  imports: [
    MatCardModule,
    CommonModule,
    MatDialogModule,
    MatIconModule,
    FlexLayoutModule,
    MatButtonModule,
  ],
  providers: [MenuItems],
  entryComponents: [
    ConfirmationDialogComponent
  ]
})
export class SharedModule {}
