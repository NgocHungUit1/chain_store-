import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerTabInfoComponent } from './customer-tab-info.component';

describe('CustomerTabInfoComponent', () => {
  let component: CustomerTabInfoComponent;
  let fixture: ComponentFixture<CustomerTabInfoComponent>;

  beforeEach(async(() => {
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
