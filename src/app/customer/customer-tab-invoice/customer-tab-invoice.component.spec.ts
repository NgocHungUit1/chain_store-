import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CustomerTabInvoiceComponent } from './customer-tab-invoice.component';

describe('CustomerTabInvoiceComponent', () => {
  let component: CustomerTabInvoiceComponent;
  let fixture: ComponentFixture<CustomerTabInvoiceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerTabInvoiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerTabInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
