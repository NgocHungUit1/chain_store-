import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
  selector: '[appInputSelectAll]'
})
export class InputSelectAllDirective {

  constructor(private elementRef: ElementRef) {
  }

  @HostListener('focus', []) onFocus() {
    const elementValue = this.elementRef.nativeElement.value;
    if (elementValue === '0') {
      this.elementRef.nativeElement.select();
    }
  }

  @HostListener('click', []) onClick() {
    const elementValue = this.elementRef.nativeElement.value;
    if (elementValue === '0') {
      this.elementRef.nativeElement.select();
    }
  }
}
