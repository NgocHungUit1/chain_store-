import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorTabInfoComponent } from './doctor-tab-info.component';

describe('DoctorTabInfoComponent', () => {
  let component: DoctorTabInfoComponent;
  let fixture: ComponentFixture<DoctorTabInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorTabInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorTabInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
