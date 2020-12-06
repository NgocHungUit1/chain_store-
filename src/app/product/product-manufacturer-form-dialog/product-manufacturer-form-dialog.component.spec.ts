import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductManufacturerFormDialogComponent } from './product-manufacturer-form-dialog.component';

describe('ProductManufacturerFormDialogComponent', () => {
  let component: ProductManufacturerFormDialogComponent;
  let fixture: ComponentFixture<ProductManufacturerFormDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductManufacturerFormDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductManufacturerFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
