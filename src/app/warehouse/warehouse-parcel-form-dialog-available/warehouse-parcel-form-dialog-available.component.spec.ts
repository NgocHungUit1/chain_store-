import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseParcelFormDialogAvailableComponent } from './warehouse-parcel-form-dialog-available.component';

describe('WarehourseParcelFormDialogAvailableComponent', () => {
  let component: WarehouseParcelFormDialogAvailableComponent;
  let fixture: ComponentFixture<WarehouseParcelFormDialogAvailableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseParcelFormDialogAvailableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseParcelFormDialogAvailableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
