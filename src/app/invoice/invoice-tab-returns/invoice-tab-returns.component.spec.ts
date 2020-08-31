import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceTabReturnsComponent } from './invoice-tab-returns.component';

describe('InvoiceTabReturnsComponent', () => {
  let component: InvoiceTabReturnsComponent;
  let fixture: ComponentFixture<InvoiceTabReturnsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceTabReturnsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceTabReturnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
