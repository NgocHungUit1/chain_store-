import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SupplierFormDialogComponent } from './product-group-form-dialog.component';

describe('ProductGroupFormDialogComponent', () => {
  let component: SupplierFormDialogComponent;
  let fixture: ComponentFixture<SupplierFormDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplierFormDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
