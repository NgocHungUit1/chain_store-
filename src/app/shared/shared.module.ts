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
  ],
  imports: [
    MatCardModule,
    CommonModule,
  ],
  providers: [MenuItems],
})
export class SharedModule {}
