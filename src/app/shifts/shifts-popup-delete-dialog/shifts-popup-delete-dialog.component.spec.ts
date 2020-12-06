import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShiftsPopupDeleteDialogComponent } from './shifts-popup-delete-dialog.component';

describe('ShiftsPopupDeleteDialogComponent', () => {
  let component: ShiftsPopupDeleteDialogComponent;
  let fixture: ComponentFixture<ShiftsPopupDeleteDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShiftsPopupDeleteDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftsPopupDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
