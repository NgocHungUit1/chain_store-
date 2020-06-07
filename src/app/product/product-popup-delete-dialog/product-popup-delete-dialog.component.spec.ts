import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPopupDeleteDialogComponent } from './product-popup-delete-dialog.component';

describe('ProductPopupDeleteDialogComponent', () => {
  let component: ProductPopupDeleteDialogComponent;
  let fixture: ComponentFixture<ProductPopupDeleteDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductPopupDeleteDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductPopupDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
