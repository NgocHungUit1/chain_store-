import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseParcelFormDialogNewComponent } from './warehouse-parcel-form-dialog-new.component';

describe('WarehourseParcelFormDialogNewComponent', () => {
  let component: WarehouseParcelFormDialogNewComponent;
  let fixture: ComponentFixture<WarehouseParcelFormDialogNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseParcelFormDialogNewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseParcelFormDialogNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
