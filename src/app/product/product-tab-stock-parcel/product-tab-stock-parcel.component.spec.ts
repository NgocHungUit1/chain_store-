import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductTabStockParcelComponent } from './product-tab-stock.component';

describe('ProductTabStockComponent', () => {
  let component: ProductTabStockParcelComponent;
  let fixture: ComponentFixture<ProductTabStockParcelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductTabStockParcelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductTabStockParcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
