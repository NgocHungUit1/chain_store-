import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleExpensesDialogComponent } from './sale-expenses-dialog.component';

describe('SaleExpensesDialogComponent', () => {
  let component: SaleExpensesDialogComponent;
  let fixture: ComponentFixture<SaleExpensesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaleExpensesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleExpensesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
