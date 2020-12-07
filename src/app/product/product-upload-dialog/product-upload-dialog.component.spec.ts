import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {ProductUploadDialogComponent} from './product-upload-dialog.component';

describe('ProductUploadDialogComponent', () => {
  let component: ProductUploadDialogComponent;
  let fixture: ComponentFixture<ProductUploadDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductUploadDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductUploadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
