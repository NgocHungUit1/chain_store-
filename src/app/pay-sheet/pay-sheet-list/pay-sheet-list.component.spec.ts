import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaySheetListComponent } from './pay-sheet-list.component';

describe('PaySheetListComponent', () => {
  let component: PaySheetListComponent;
  let fixture: ComponentFixture<PaySheetListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaySheetListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaySheetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
