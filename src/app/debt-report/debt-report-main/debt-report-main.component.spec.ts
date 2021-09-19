import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtReportMainComponent } from './debt-report-main.component';

describe('DebtReportMainComponent', () => {
  let component: DebtReportMainComponent;
  let fixture: ComponentFixture<DebtReportMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DebtReportMainComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DebtReportMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
