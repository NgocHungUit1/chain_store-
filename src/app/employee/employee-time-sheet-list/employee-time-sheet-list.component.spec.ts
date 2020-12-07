import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EmployeeTimeSheetListComponent } from './employee-time-sheet-list.component';

describe('EmployeeTimeSheetListComponent', () => {
  let component: EmployeeTimeSheetListComponent;
  let fixture: ComponentFixture<EmployeeTimeSheetListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeTimeSheetListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeTimeSheetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
