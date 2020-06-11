import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerPopupDeleteDialogComponent } from './customer-popup-delete-dialog.component';

describe('CustomerPopupDeleteDialogComponent', () => {
  let component: CustomerPopupDeleteDialogComponent;
  let fixture: ComponentFixture<CustomerPopupDeleteDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerPopupDeleteDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerPopupDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
