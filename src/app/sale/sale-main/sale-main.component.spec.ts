import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleMainComponent } from './sale-main.component';

describe('SaleMainComponent', () => {
  let component: SaleMainComponent;
  let fixture: ComponentFixture<SaleMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaleMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
