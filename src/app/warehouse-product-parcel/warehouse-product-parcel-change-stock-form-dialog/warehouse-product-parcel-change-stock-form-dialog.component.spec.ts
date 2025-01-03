import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseProductParcelChangeStockFormDialogComponent } from './warehouse-product-parcel-change-stock-form-dialog.component';

describe('GroupFormDialogComponent', () => {
  let component: WarehouseProductParcelChangeStockFormDialogComponent;
  let fixture: ComponentFixture<WarehouseProductParcelChangeStockFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseProductParcelChangeStockFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseProductParcelChangeStockFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
