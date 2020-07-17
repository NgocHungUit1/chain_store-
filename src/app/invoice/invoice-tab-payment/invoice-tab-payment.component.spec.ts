import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceTabPaymentComponent } from './invoice-tab-payment.component';

describe('InvoiceTabPaymentComponent', () => {
  let component: InvoiceTabPaymentComponent;
  let fixture: ComponentFixture<InvoiceTabPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceTabPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceTabPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
