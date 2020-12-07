import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CustomerTabDebtComponent } from './customer-tab-debt.component';

describe('CustomerTabDebtComponent', () => {
  let component: CustomerTabDebtComponent;
  let fixture: ComponentFixture<CustomerTabDebtComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerTabDebtComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerTabDebtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
