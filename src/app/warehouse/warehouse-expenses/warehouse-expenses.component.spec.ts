import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseExpensesComponent } from './warehouse-expenses.component';

describe('WarehouseExpensesComponent', () => {
  let component: WarehouseExpensesComponent;
  let fixture: ComponentFixture<WarehouseExpensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseExpensesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
