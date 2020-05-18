import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductUsingFormDialogComponent } from './product-group-form-dialog.component';

describe('ProductGroupFormDialogComponent', () => {
  let component: ProductUsingFormDialogComponent;
  let fixture: ComponentFixture<ProductUsingFormDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductUsingFormDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductUsingFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
