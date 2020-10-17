import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StockTakeInfoTabComponent } from './stock-take-info-tab.component';

describe('StockTakeInfoTabComponent', () => {
  let component: StockTakeInfoTabComponent;
  let fixture: ComponentFixture<StockTakeInfoTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StockTakeInfoTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StockTakeInfoTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
