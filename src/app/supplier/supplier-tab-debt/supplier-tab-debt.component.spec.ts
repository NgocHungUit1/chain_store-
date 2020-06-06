import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTabStockComponent } from './product-tab-stock.component';

describe('ProductTabStockComponent', () => {
  let component: ProductTabStockComponent;
  let fixture: ComponentFixture<ProductTabStockComponent>;

  beforeEach(async(() => {
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
