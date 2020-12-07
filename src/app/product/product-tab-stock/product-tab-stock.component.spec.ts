import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductTabStockComponent } from './product-tab-stock.component';

describe('ProductTabStockComponent', () => {
  let component: ProductTabStockComponent;
  let fixture: ComponentFixture<ProductTabStockComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductTabStockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductTabStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
