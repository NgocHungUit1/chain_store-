import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseProductMedicineDialogComponent } from './warehouse-product-medicine-dialog.component';

describe('WarehouseProductMedicineDialogComponent', () => {
  let component: WarehouseProductMedicineDialogComponent;
  let fixture: ComponentFixture<WarehouseProductMedicineDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseProductMedicineDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseProductMedicineDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
