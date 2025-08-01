import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductNewUnitComponent } from './product-new-unit.component';

describe('ProductNewUnitComponent', () => {
  let component: ProductNewUnitComponent;
  let fixture: ComponentFixture<ProductNewUnitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductNewUnitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductNewUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
