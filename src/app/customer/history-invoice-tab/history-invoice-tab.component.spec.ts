import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryInvoiceTabComponent } from './history-invoice-tab.component';

describe('HistoryInvoiceTabComponent', () => {
  let component: HistoryInvoiceTabComponent;
  let fixture: ComponentFixture<HistoryInvoiceTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoryInvoiceTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryInvoiceTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
