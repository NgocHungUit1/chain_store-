import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupCommonPriceDialogComponent } from './setup-common-price-dialog.component';

describe('SetupCommonPriceDialogComponent', () => {
  let component: SetupCommonPriceDialogComponent;
  let fixture: ComponentFixture<SetupCommonPriceDialogComponent>;

  beforeEach(async(() => {
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
