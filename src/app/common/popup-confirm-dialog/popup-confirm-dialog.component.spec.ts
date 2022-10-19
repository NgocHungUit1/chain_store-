import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupConfirmDialogComponent } from './popup-confirm-dialog.component';

describe('PopupConfirmDialogComponent', () => {
  let component: PopupConfirmDialogComponent;
  let fixture: ComponentFixture<PopupConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupConfirmDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
