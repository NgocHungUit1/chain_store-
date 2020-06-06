import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierFormDialogComponent } from './product-group-form-dialog.component';

describe('ProductGroupFormDialogComponent', () => {
  let component: SupplierFormDialogComponent;
  let fixture: ComponentFixture<SupplierFormDialogComponent>;

  beforeEach(async(() => {
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
