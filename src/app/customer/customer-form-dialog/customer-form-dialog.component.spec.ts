import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerFormDialogComponent } from './customer-form-dialog.component';

describe('CustomerFormDialogComponent', () => {
  let component: CustomerFormDialogComponent;
  let fixture: ComponentFixture<CustomerFormDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerFormDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
