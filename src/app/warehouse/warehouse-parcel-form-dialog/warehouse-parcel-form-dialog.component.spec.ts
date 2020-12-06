import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WarehouseParcelFormDialogComponent } from './warehouse-parcel-form-dialog.component';

describe('WarehouseParcelFormDialogComponent', () => {
  let component: WarehouseParcelFormDialogComponent;
  let fixture: ComponentFixture<WarehouseParcelFormDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseParcelFormDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseParcelFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
