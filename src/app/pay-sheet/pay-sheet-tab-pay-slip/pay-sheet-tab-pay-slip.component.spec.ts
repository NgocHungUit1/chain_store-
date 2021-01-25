import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaySheetTabPaySlipComponent } from './pay-sheet-tab-pay-slip.component';

describe('PaySheetTabPaySlipComponent', () => {
  let component: PaySheetTabPaySlipComponent;
  let fixture: ComponentFixture<PaySheetTabPaySlipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaySheetTabPaySlipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaySheetTabPaySlipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
