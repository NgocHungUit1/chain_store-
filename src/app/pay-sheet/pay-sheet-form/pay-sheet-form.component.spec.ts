import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaySheetFormComponent } from './pay-sheet-form.component';

describe('PaySheetFormComponent', () => {
  let component: PaySheetFormComponent;
  let fixture: ComponentFixture<PaySheetFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaySheetFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaySheetFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
