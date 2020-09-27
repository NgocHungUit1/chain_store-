import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPopupDeleteDialogComponent } from './user-popup-delete-dialog.component';

describe('UserPopupDeleteDialogComponent', () => {
  let component: UserPopupDeleteDialogComponent;
  let fixture: ComponentFixture<UserPopupDeleteDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserPopupDeleteDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPopupDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
