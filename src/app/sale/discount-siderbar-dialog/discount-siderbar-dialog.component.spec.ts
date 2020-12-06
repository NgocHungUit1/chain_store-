import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DiscountSiderbarDialogComponent } from './discount-siderbar-dialog.component';

describe('DiscountSiderbarDialogComponent', () => {
  let component: DiscountSiderbarDialogComponent;
  let fixture: ComponentFixture<DiscountSiderbarDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscountSiderbarDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscountSiderbarDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
