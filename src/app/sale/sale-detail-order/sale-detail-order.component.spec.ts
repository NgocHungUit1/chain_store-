import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleDetailOrderComponent } from './sale-detail-order.component';

describe('SaleDetailOrderComponent', () => {
  let component: SaleDetailOrderComponent;
  let fixture: ComponentFixture<SaleDetailOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaleDetailOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleDetailOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
