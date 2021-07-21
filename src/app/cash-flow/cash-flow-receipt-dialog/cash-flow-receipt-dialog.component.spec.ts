import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashFlowReceiptDialogComponent } from './cash-flow-receipt-dialog.component';

describe('CashFlowReceiptDialogComponent', () => {
  let component: CashFlowReceiptDialogComponent;
  let fixture: ComponentFixture<CashFlowReceiptDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashFlowReceiptDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CashFlowReceiptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
