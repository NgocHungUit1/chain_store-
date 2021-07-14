import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseFormPriceDialogComponent } from './warehouse-form-price-dialog.component';

describe('WarehouseFormPriceDialogComponent', () => {
  let component: WarehouseFormPriceDialogComponent;
  let fixture: ComponentFixture<WarehouseFormPriceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseFormPriceDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseFormPriceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
