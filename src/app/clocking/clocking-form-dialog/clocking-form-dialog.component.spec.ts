import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ClockingFormDialogComponent } from './clocking-form-dialog.component';

describe('ClockingFormDialogComponent', () => {
  let component: ClockingFormDialogComponent;
  let fixture: ComponentFixture<ClockingFormDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ClockingFormDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClockingFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
