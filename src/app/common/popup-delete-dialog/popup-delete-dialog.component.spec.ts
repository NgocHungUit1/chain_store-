import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDeleteDialogComponent } from './popup-delete-dialog.component';

describe('PopupDeleteDialogComponent', () => {
  let component: PopupDeleteDialogComponent;
  let fixture: ComponentFixture<PopupDeleteDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupDeleteDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
