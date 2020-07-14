import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceDetailOrderDialogComponent } from './price-detail-order-dialog.component';

describe('PriceDetailOrderDialogComponent', () => {
  let component: PriceDetailOrderDialogComponent;
  let fixture: ComponentFixture<PriceDetailOrderDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PriceDetailOrderDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceDetailOrderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
