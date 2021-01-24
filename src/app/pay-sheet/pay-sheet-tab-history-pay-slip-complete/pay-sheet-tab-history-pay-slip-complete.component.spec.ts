import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaySheetTabHistoryPaySlipCompleteComponent } from './pay-sheet-tab-history-pay-slip-complete.component';

describe('PaySheetTabHistoryPaySlipCompleteComponent', () => {
  let component: PaySheetTabHistoryPaySlipCompleteComponent;
  let fixture: ComponentFixture<PaySheetTabHistoryPaySlipCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaySheetTabHistoryPaySlipCompleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaySheetTabHistoryPaySlipCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
