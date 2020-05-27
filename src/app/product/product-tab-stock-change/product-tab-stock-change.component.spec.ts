import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTabStockChangeComponent } from './product-tab-stock-change.component';

describe('ProductTabStockChangeComponent', () => {
  let component: ProductTabStockChangeComponent;
  let fixture: ComponentFixture<ProductTabStockChangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductTabStockChangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductTabStockChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
