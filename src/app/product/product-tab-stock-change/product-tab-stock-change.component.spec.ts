import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductTabStockChangeComponent } from './product-tab-stock-change.component';

describe('ProductTabStockChangeComponent', () => {
  let component: ProductTabStockChangeComponent;
  let fixture: ComponentFixture<ProductTabStockChangeComponent>;

  beforeEach(waitForAsync(() => {
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
