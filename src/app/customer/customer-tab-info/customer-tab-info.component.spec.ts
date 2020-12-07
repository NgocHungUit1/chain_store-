import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CustomerTabInfoComponent } from './customer-tab-info.component';

describe('CustomerTabInfoComponent', () => {
  let component: CustomerTabInfoComponent;
  let fixture: ComponentFixture<CustomerTabInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerTabInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerTabInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
