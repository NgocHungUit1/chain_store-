import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MedicineFormDialogComponent } from './medicine-form-dialog.component';

describe('MedicineFormDialogComponent', () => {
  let component: MedicineFormDialogComponent;
  let fixture: ComponentFixture<MedicineFormDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MedicineFormDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicineFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
