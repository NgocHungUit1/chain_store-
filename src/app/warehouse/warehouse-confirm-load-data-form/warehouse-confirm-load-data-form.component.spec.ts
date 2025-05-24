import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseConfirmLoadDataFormComponent } from './warehouse-confirm-load-data-form.component';

describe('WarehouseConfirmLoadDataFormComponent', () => {
  let component: WarehouseConfirmLoadDataFormComponent;
  let fixture: ComponentFixture<WarehouseConfirmLoadDataFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseConfirmLoadDataFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseConfirmLoadDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
