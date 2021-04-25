import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-support-main',
  templateUrl: './support-main.component.html',
  styleUrls: ['./support-main.component.css']
})
export class SupportMainComponent implements OnInit {

  isLoadingResults = true;
  isRateLimitReached = false;

  constructor() { }

  ngOnInit(): void {
    this.isLoadingResults = false;
  }

}
