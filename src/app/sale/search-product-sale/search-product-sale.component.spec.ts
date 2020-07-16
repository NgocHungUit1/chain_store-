import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchProductSaleComponent } from './search-product-sale.component';

describe('SearchProductSaleComponent', () => {
  let component: SearchProductSaleComponent;
  let fixture: ComponentFixture<SearchProductSaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchProductSaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchProductSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
