import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CustomerTabPointComponent } from './customer-tab-point.component';

describe('ProductTabStockChangeComponent', () => {
  let component: CustomerTabPointComponent;
  let fixture: ComponentFixture<CustomerTabPointComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerTabPointComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerTabPointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
