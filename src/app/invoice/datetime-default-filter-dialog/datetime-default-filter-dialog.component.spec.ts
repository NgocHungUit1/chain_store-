import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatetimeDefaultFilterDialogComponent } from './datetime-default-filter-dialog.component';

describe('DatetimeDefaultFilterDialogComponent', () => {
  let component: DatetimeDefaultFilterDialogComponent;
  let fixture: ComponentFixture<DatetimeDefaultFilterDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatetimeDefaultFilterDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatetimeDefaultFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
