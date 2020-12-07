import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PaymentSiderbarDialogComponent } from './payment-siderbar-dialog.component';

describe('PaymentSiderbarDialogComponent', () => {
  let component: PaymentSiderbarDialogComponent;
  let fixture: ComponentFixture<PaymentSiderbarDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentSiderbarDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentSiderbarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
