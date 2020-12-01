import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeTimeSheetListComponent } from './employee-time-sheet-list.component';

describe('EmployeeTimeSheetListComponent', () => {
  let component: EmployeeTimeSheetListComponent;
  let fixture: ComponentFixture<EmployeeTimeSheetListComponent>;

  beforeEach(async(() => {
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
