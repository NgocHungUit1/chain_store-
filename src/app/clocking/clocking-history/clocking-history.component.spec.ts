import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClockingHistoryComponent } from './clocking-history.component';

describe('ClockingHistoryComponent', () => {
  let component: ClockingHistoryComponent;
  let fixture: ComponentFixture<ClockingHistoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ClockingHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClockingHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
