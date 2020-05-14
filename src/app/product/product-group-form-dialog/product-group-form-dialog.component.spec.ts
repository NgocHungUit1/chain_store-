import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductGroupFormDialogComponent } from './product-group-form-dialog.component';

describe('ProductGroupFormDialogComponent', () => {
  let component: ProductGroupFormDialogComponent;
  let fixture: ComponentFixture<ProductGroupFormDialogComponent>;

  beforeEach(async(() => {
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
