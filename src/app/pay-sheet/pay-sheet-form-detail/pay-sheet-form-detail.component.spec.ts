import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaySheetFormDetailComponent } from './pay-sheet-form-detail.component';

describe('PaySheetFormDetailComponent', () => {
  let component: PaySheetFormDetailComponent;
  let fixture: ComponentFixture<PaySheetFormDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaySheetFormDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaySheetFormDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
