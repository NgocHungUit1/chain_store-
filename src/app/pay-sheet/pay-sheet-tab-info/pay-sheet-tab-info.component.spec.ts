import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaySheetTabInfoComponent } from './pay-sheet-tab-info.component';

describe('PaySheetTabInfoComponent', () => {
  let component: PaySheetTabInfoComponent;
  let fixture: ComponentFixture<PaySheetTabInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaySheetTabInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaySheetTabInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
