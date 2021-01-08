import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseParcelListDialogComponent } from './warehouse-parcel-list-dialog.component';

describe('WarehouseParcelListDialogComponent', () => {
  let component: WarehouseParcelListDialogComponent;
  let fixture: ComponentFixture<WarehouseParcelListDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseParcelListDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseParcelListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
