import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTabInfoComponent } from './product-tab-info.component';

describe('ProductTabInfoComponent', () => {
  let component: ProductTabInfoComponent;
  let fixture: ComponentFixture<ProductTabInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductTabInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductTabInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
