import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesTransactionListComponent } from './expenses-transaction-list.component';

describe('ExpensesTransactionListComponent', () => {
  let component: ExpensesTransactionListComponent;
  let fixture: ComponentFixture<ExpensesTransactionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpensesTransactionListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpensesTransactionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
