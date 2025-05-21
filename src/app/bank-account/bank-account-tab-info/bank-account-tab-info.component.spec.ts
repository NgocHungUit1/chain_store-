import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAccountTabInfoComponent } from './bank-account-tab-info.component';

describe('DoctorTabInfoComponent', () => {
  let component: BankAccountTabInfoComponent;
  let fixture: ComponentFixture<BankAccountTabInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BankAccountTabInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BankAccountTabInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
