import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseUploadDialogComponent } from './warehouse-upload-dialog.component';

describe('WarehouseUploadDialogComponent', () => {
  let component: WarehouseUploadDialogComponent;
  let fixture: ComponentFixture<WarehouseUploadDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseUploadDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseUploadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
