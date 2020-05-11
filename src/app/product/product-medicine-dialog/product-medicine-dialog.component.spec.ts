import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductMedicineDialogComponent } from './product-medicine-dialog.component';

describe('ProductMedicineDialogComponent', () => {
  let component: ProductMedicineDialogComponent;
  let fixture: ComponentFixture<ProductMedicineDialogComponent>;

  beforeEach(async(() => {
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
