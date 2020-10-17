import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StockTakeListComponent } from './stock-take-list.component';

describe('StockTakeListComponent', () => {
  let component: StockTakeListComponent;
  let fixture: ComponentFixture<StockTakeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StockTakeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StockTakeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
