import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductMedicineDialogComponent } from './product-medicine-dialog.component';

describe('ProductMedicineDialogComponent', () => {
  let component: ProductMedicineDialogComponent;
  let fixture: ComponentFixture<ProductMedicineDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductMedicineDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductMedicineDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
