import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashFlowPaymentDialogComponent } from './cash-flow-payment-dialog.component';

describe('CashFlowPaymentDialogComponent', () => {
  let component: CashFlowPaymentDialogComponent;
  let fixture: ComponentFixture<CashFlowPaymentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashFlowPaymentDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CashFlowPaymentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
