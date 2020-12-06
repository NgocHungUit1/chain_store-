import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SaleReportMainComponent } from './sale-report-main.component';

describe('SaleReportMainComponent', () => {
  let component: SaleReportMainComponent;
  let fixture: ComponentFixture<SaleReportMainComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SaleReportMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleReportMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
