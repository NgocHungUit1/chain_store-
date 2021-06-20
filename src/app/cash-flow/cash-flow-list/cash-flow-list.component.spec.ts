import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashFlowListComponent } from './cash-flow-list.component';

describe('CashFlowListComponent', () => {
  let component: CashFlowListComponent;
  let fixture: ComponentFixture<CashFlowListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashFlowListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CashFlowListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
