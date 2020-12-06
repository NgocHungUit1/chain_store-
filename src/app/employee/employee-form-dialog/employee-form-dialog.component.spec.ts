import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EmployeeFormDialogComponent } from './employee-form-dialog.component';

describe('EmployeeFormDialogComponent', () => {
  let component: EmployeeFormDialogComponent;
  let fixture: ComponentFixture<EmployeeFormDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeFormDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
