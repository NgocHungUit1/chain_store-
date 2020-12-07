import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetConfirmDeleteClockingDialogComponent } from './timesheet-confirm-delete-clocking-dialog.component';

describe('TimesheetConfirmDeleteClockingDialogComponent', () => {
  let component: TimesheetConfirmDeleteClockingDialogComponent;
  let fixture: ComponentFixture<TimesheetConfirmDeleteClockingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimesheetConfirmDeleteClockingDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetConfirmDeleteClockingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
