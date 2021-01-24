import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidayFormDialogComponent } from './holiday-form-dialog.component';

describe('HolidayFormDialogComponent', () => {
  let component: HolidayFormDialogComponent;
  let fixture: ComponentFixture<HolidayFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HolidayFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HolidayFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
