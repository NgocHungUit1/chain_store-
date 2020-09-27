import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePopupDeleteDialogComponent } from './employee-popup-delete-dialog.component';

describe('EmployeePopupDeleteDialogComponent', () => {
  let component: EmployeePopupDeleteDialogComponent;
  let fixture: ComponentFixture<EmployeePopupDeleteDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeePopupDeleteDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeePopupDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
