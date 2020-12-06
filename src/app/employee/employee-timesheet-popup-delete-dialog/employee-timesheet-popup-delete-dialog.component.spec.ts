import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EmployeeTimesheetPopupDeleteDialogComponent } from './employee-timesheet-popup-delete-dialog.component';

describe('EmployeeTimesheetPopupDeleteDialogComponent', () => {
  let component: EmployeeTimesheetPopupDeleteDialogComponent;
  let fixture: ComponentFixture<EmployeeTimesheetPopupDeleteDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeTimesheetPopupDeleteDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeTimesheetPopupDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
