import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductReportMainComponent } from './product-report-main.component';

describe('ProductReportMainComponent', () => {
  let component: ProductReportMainComponent;
  let fixture: ComponentFixture<ProductReportMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductReportMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductReportMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
