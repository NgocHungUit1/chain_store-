import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceTabInfoComponent } from './invoice-tab-info.component';

describe('InvoiceTabInfoComponent', () => {
  let component: InvoiceTabInfoComponent;
  let fixture: ComponentFixture<InvoiceTabInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceTabInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceTabInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
