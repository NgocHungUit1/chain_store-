import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SaleListProductComponent } from './sale-list-product.component';

describe('SaleListProductComponent', () => {
  let component: SaleListProductComponent;
  let fixture: ComponentFixture<SaleListProductComponent>;

  beforeEach(waitForAsync(() => {
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
