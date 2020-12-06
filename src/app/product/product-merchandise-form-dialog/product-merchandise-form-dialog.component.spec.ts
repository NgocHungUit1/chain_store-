import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductMerchandiseFormDialogComponent } from './product-merchandise-form-dialog.component';

describe('ProductMerchandiseFormDialogComponent', () => {
  let component: ProductMerchandiseFormDialogComponent;
  let fixture: ComponentFixture<ProductMerchandiseFormDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductMerchandiseFormDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductMerchandiseFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
