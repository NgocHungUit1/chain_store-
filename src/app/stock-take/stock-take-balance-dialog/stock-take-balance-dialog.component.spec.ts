import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StockTakeBalanceDialogComponent } from './stock-take-balance-dialog.component';

describe('StockTakeBalanceDialogComponent', () => {
  let component: StockTakeBalanceDialogComponent;
  let fixture: ComponentFixture<StockTakeBalanceDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StockTakeBalanceDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StockTakeBalanceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
