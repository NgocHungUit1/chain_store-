import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleSiderbarOrderComponent } from './sale-siderbar-order.component';

describe('SaleSiderbarOrderComponent', () => {
  let component: SaleSiderbarOrderComponent;
  let fixture: ComponentFixture<SaleSiderbarOrderComponent>;

  beforeEach(async(() => {
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
