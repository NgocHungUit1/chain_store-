import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeTimesheetPopupDeleteDialogComponent } from './employee-timesheet-popup-delete-dialog.component';

describe('EmployeeTimesheetPopupDeleteDialogComponent', () => {
  let component: EmployeeTimesheetPopupDeleteDialogComponent;
  let fixture: ComponentFixture<EmployeeTimesheetPopupDeleteDialogComponent>;

  beforeEach(async(() => {
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
