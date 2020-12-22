import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesOrderListComponent } from './expenses-order-list.component';

describe('ExpensesOrderListComponent', () => {
  let component: ExpensesOrderListComponent;
  let fixture: ComponentFixture<ExpensesOrderListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpensesOrderListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpensesOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
