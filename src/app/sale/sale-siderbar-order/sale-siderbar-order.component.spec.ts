import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SaleSiderbarOrderComponent } from './sale-siderbar-order.component';

describe('SaleSiderbarOrderComponent', () => {
  let component: SaleSiderbarOrderComponent;
  let fixture: ComponentFixture<SaleSiderbarOrderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SaleSiderbarOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleSiderbarOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
