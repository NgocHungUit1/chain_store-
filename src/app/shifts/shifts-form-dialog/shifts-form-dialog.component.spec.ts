import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftsFormDialogComponent } from './shifts-form-dialog.component';

describe('ShiftsFormDialogComponent', () => {
  let component: ShiftsFormDialogComponent;
  let fixture: ComponentFixture<ShiftsFormDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShiftsFormDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftsFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
