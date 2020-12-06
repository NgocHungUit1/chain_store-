import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductStockChangeDialogComponent } from './product-stock-change-dialog.component';

describe('ProductStockChangeDialogComponent', () => {
  let component: ProductStockChangeDialogComponent;
  let fixture: ComponentFixture<ProductStockChangeDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductStockChangeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductStockChangeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
