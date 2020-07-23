import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatetimeChooseFilterDialogComponent } from './datetime-choose-filter-dialog.component';

describe('DatetimeChooseFilterDialogComponent', () => {
  let component: DatetimeChooseFilterDialogComponent;
  let fixture: ComponentFixture<DatetimeChooseFilterDialogComponent>;

  beforeEach(async(() => {
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
