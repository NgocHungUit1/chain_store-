import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesOrderFormDialogComponent } from './expenses-order-form-dialog.component';

describe('ExpensesOrderFormDialogComponent', () => {
  let component: ExpensesOrderFormDialogComponent;
  let fixture: ComponentFixture<ExpensesOrderFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpensesOrderFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpensesOrderFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
