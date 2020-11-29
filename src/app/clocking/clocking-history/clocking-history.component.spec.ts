import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClockingHistoryComponent } from './clocking-history.component';

describe('ClockingHistoryComponent', () => {
  let component: ClockingHistoryComponent;
  let fixture: ComponentFixture<ClockingHistoryComponent>;

  beforeEach(async(() => {
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
