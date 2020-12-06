import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProductGroupFormDialogComponent } from './product-group-form-dialog.component';

describe('ProductGroupFormDialogComponent', () => {
  let component: ProductGroupFormDialogComponent;
  let fixture: ComponentFixture<ProductGroupFormDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductGroupFormDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductGroupFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
