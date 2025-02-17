import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseParcelFormDialogSelectComponent } from './warehouse-parcel-form-dialog-select.component';

describe('WarehouseParcelFormDialogSelectComponent', () => {
  let component: WarehouseParcelFormDialogSelectComponent;
  let fixture: ComponentFixture<WarehouseParcelFormDialogSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseParcelFormDialogSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseParcelFormDialogSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
