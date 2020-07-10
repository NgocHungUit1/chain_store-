import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleCustomerFormDialogComponent } from './sale-customer-form-dialog.component';

describe('SaleCustomerFormDialogComponent', () => {
  let component: SaleCustomerFormDialogComponent;
  let fixture: ComponentFixture<SaleCustomerFormDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaleCustomerFormDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleCustomerFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
