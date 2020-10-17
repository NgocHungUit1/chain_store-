import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StockTake } from '../stock-take.model';

@Component({
  selector: 'app-stock-take-info-tab',
  templateUrl: './stock-take-info-tab.component.html',
  styleUrls: ['./stock-take-info-tab.component.css']
})
export class StockTakeInfoTabComponent implements OnInit {

  @Input() stockTake: StockTake;
  @Input() expandedElement: boolean;
  @Output() reload: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

}
