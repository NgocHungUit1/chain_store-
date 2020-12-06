import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WarehouseDiscountDialogComponent } from './warehouse-discount-dialog.component';

describe('WarehouseDiscountDialogComponent', () => {
  let component: WarehouseDiscountDialogComponent;
  let fixture: ComponentFixture<WarehouseDiscountDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseDiscountDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseDiscountDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
