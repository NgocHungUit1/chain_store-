import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalFacilityFormDialogComponent } from './medical-facility-form-dialog.component';

describe('MedicalFacilityFormDialogComponent', () => {
  let component: MedicalFacilityFormDialogComponent;
  let fixture: ComponentFixture<MedicalFacilityFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MedicalFacilityFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicalFacilityFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
