import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseFormAmountComponent } from './warehouse-form-amount.component';

describe('WarehouseFormAmountComponent', () => {
  let component: WarehouseFormAmountComponent;
  let fixture: ComponentFixture<WarehouseFormAmountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseFormAmountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseFormAmountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
