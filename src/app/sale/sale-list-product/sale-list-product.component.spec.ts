import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleListProductComponent } from './sale-list-product.component';

describe('SaleListProductComponent', () => {
  let component: SaleListProductComponent;
  let fixture: ComponentFixture<SaleListProductComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaleListProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleListProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
