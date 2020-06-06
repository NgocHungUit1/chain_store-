import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductManufacturerFormDialogComponent } from './product-manufacturer-form-dialog.component';

describe('ProductManufacturerFormDialogComponent', () => {
  let component: ProductManufacturerFormDialogComponent;
  let fixture: ComponentFixture<ProductManufacturerFormDialogComponent>;

  beforeEach(async(() => {
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
