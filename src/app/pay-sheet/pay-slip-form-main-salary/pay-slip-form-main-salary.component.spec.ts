import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaySlipFormMainSalaryComponent } from './pay-slip-form-main-salary.component';

describe('PaySlipFormMainSalaryComponent', () => {
  let component: PaySlipFormMainSalaryComponent;
  let fixture: ComponentFixture<PaySlipFormMainSalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaySlipFormMainSalaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaySlipFormMainSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
