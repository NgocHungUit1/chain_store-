import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DatetimeChooseFilterDialogComponent } from './datetime-choose-filter-dialog.component';

describe('DatetimeChooseFilterDialogComponent', () => {
  let component: DatetimeChooseFilterDialogComponent;
  let fixture: ComponentFixture<DatetimeChooseFilterDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DatetimeChooseFilterDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatetimeChooseFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
