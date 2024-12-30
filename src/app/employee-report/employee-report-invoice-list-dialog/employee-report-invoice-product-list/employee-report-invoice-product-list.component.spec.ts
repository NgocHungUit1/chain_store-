import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EmployeeReportInvoiceProductListComponent } from './employee-report-invoice-product-list.component';

describe('InvoiceTabPaymentComponent', () => {
  let component: EmployeeReportInvoiceProductListComponent;
  let fixture: ComponentFixture<EmployeeReportInvoiceProductListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeReportInvoiceProductListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeReportInvoiceProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
