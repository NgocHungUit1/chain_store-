import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalePrintInvoiceDialogComponent } from './sale-print-invoice-dialog.component';

describe('SalePrintInvoiceDialogComponent', () => {
  let component: SalePrintInvoiceDialogComponent;
  let fixture: ComponentFixture<SalePrintInvoiceDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalePrintInvoiceDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalePrintInvoiceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
