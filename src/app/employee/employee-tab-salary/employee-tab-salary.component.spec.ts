import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeTabSalaryComponent } from './employee-tab-salary.component';

describe('EmployeeTabSalaryComponent', () => {
  let component: EmployeeTabSalaryComponent;
  let fixture: ComponentFixture<EmployeeTabSalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeTabSalaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeTabSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
