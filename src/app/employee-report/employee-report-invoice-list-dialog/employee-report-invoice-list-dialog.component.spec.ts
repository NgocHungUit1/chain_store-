import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeReportInvoiceListDialogComponent } from './employee-report-invoice-list-dialog.component';

describe('InvoiceSearchDialogComponent', () => {
  let component: EmployeeReportInvoiceListDialogComponent;
  let fixture: ComponentFixture<EmployeeReportInvoiceListDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeReportInvoiceListDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeReportInvoiceListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
