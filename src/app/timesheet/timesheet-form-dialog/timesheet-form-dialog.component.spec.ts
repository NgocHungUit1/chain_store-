import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetFormDialogComponent } from './timesheet-form-dialog.component';

describe('TimesheetFormDialogComponent', () => {
  let component: TimesheetFormDialogComponent;
  let fixture: ComponentFixture<TimesheetFormDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimesheetFormDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
