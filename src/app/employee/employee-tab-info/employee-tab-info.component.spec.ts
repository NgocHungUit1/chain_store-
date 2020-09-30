import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeTabInfoComponent } from './employee-tab-info.component';

describe('EmployeeTabInfoComponent', () => {
  let component: EmployeeTabInfoComponent;
  let fixture: ComponentFixture<EmployeeTabInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeTabInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeTabInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
