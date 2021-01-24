import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidayPopupDeleteDialogComponent } from './holiday-popup-delete-dialog.component';

describe('HolidayPopupDeleteDialogComponent', () => {
  let component: HolidayPopupDeleteDialogComponent;
  let fixture: ComponentFixture<HolidayPopupDeleteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HolidayPopupDeleteDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HolidayPopupDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
