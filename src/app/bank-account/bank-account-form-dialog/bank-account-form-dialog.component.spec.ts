import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAccountFormDialogComponent } from './bank-account-form-dialog.component';

describe('DoctorFormDialogComponent', () => {
  let component: BankAccountFormDialogComponent;
  let fixture: ComponentFixture<BankAccountFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BankAccountFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BankAccountFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
