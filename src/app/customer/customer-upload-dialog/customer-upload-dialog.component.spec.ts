import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {SupplierUploadDialogComponent} from './product-upload-dialog.component';

describe('ProductUploadDialogComponent', () => {
  let component: SupplierUploadDialogComponent;
  let fixture: ComponentFixture<SupplierUploadDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplierUploadDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierUploadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
