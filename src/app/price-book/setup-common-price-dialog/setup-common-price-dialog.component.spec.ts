import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SetupCommonPriceDialogComponent } from './setup-common-price-dialog.component';

describe('SetupCommonPriceDialogComponent', () => {
  let component: SetupCommonPriceDialogComponent;
  let fixture: ComponentFixture<SetupCommonPriceDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupCommonPriceDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupCommonPriceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
