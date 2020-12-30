import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesTransactionTabInfoComponent } from './expenses-transaction-tab-info.component';

describe('ExpensesTransactionTabInfoComponent', () => {
  let component: ExpensesTransactionTabInfoComponent;
  let fixture: ComponentFixture<ExpensesTransactionTabInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpensesTransactionTabInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpensesTransactionTabInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
