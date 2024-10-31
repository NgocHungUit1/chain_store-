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

@NgModule({
  declarations: [
    AccordionAnchorDirective,
    AccordionLinkDirective,
    AccordionDirective,
    IncludesPipe,
    FilterPipe,
    PopoverComponent,
  ],
  exports: [
    AccordionAnchorDirective,
    AccordionLinkDirective,
    AccordionDirective,
    IncludesPipe,
    PopoverComponent,
    PopoverComponent,
  ],
  imports: [
    MatCardModule,
    CommonModule,
  ],
  providers: [MenuItems],
})
export class SharedModule {}
