import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorFormDialogComponent } from './doctor-form-dialog.component';

describe('DoctorFormDialogComponent', () => {
  let component: DoctorFormDialogComponent;
  let fixture: ComponentFixture<DoctorFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
