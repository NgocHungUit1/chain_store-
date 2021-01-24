import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesOrderTabInfoComponent } from './expenses-order-tab-info.component';

describe('ExpensesOrderTabInfoComponent', () => {
  let component: ExpensesOrderTabInfoComponent;
  let fixture: ComponentFixture<ExpensesOrderTabInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpensesOrderTabInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpensesOrderTabInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
