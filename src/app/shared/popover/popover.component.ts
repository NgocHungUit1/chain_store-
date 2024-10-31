import { Component, ElementRef, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.css']
})
export class PopoverComponent implements OnInit {
  show: boolean = false;
  useToggle = false;

  constructor(private eRef: ElementRef) { }

  ngOnInit(): void {
  }

  toggle() {
    this.show = !this.show;
    this.useToggle = true;
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (!this.eRef.nativeElement.contains(event.target) && this.show && !this.useToggle) {
      this.show = false;
    }
    this.useToggle = false;
  }
}
