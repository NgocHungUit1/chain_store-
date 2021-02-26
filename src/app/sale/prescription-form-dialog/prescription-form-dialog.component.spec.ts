import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionFormDialogComponent } from './prescription-form-dialog.component';

describe('PrescriptionFormDialogComponent', () => {
  let component: PrescriptionFormDialogComponent;
  let fixture: ComponentFixture<PrescriptionFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrescriptionFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrescriptionFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
