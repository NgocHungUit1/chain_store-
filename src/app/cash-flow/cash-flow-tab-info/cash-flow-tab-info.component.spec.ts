import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashFlowTabInfoComponent } from './cash-flow-tab-info.component';

describe('CashFlowTabInfoComponent', () => {
  let component: CashFlowTabInfoComponent;
  let fixture: ComponentFixture<CashFlowTabInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashFlowTabInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CashFlowTabInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
