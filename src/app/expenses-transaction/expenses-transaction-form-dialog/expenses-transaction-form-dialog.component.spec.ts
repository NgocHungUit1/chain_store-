import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesTransactionFormDialogComponent } from './expenses-transaction-form-dialog.component';

describe('ExpensesTransactionFormDialogComponent', () => {
  let component: ExpensesTransactionFormDialogComponent;
  let fixture: ComponentFixture<ExpensesTransactionFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpensesTransactionFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpensesTransactionFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
