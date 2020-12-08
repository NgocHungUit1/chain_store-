import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetFormDeleteClockingDialogComponent } from './timesheet-form-delete-clocking-dialog.component';

describe('TimesheetFormDeleteClockingDialogComponent', () => {
  let component: TimesheetFormDeleteClockingDialogComponent;
  let fixture: ComponentFixture<TimesheetFormDeleteClockingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimesheetFormDeleteClockingDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetFormDeleteClockingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
