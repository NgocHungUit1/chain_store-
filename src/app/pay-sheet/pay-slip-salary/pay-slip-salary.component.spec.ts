import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaySlipSalaryComponent } from './pay-slip-salary.component';

describe('PaySlipSalaryComponent', () => {
  let component: PaySlipSalaryComponent;
  let fixture: ComponentFixture<PaySlipSalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaySlipSalaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaySlipSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
