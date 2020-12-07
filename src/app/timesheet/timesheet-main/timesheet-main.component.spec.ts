import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TimesheetMainComponent } from './timesheet-main.component';

describe('TimesheetMainComponent', () => {
  let component: TimesheetMainComponent;
  let fixture: ComponentFixture<TimesheetMainComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TimesheetMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimesheetMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
