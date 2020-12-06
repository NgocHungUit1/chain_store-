import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SupplierTabInfoComponent } from './product-tab-info.component';

describe('ProductTabInfoComponent', () => {
  let component: SupplierTabInfoComponent;
  let fixture: ComponentFixture<SupplierTabInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplierTabInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierTabInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
