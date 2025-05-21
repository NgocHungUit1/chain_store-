import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleProductParcelSelectDialogComponent } from './sale-product-parcel-select-dialog.component';

describe('SaleProductParcelSelectDialogComponent', () => {
  let component: SaleProductParcelSelectDialogComponent;
  let fixture: ComponentFixture<SaleProductParcelSelectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaleProductParcelSelectDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleProductParcelSelectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
