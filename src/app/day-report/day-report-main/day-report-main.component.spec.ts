import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DayReportMainComponent } from './day-report-main.component';

describe('DayReportMainComponent', () => {
  let component: DayReportMainComponent;
  let fixture: ComponentFixture<DayReportMainComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DayReportMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DayReportMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
