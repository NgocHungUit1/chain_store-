import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EmployeeReportMainComponent } from './employee-report-main.component';

describe('ProductReportMainComponent', () => {
  let component: EmployeeReportMainComponent;
  let fixture: ComponentFixture<EmployeeReportMainComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeReportMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeReportMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
