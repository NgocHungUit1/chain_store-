import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewIdCodeFormDialogComponent } from './view-id-code-form-dialog.component';

describe('ViewIdCodeFormDialogComponent', () => {
  let component: ViewIdCodeFormDialogComponent;
  let fixture: ComponentFixture<ViewIdCodeFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewIdCodeFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewIdCodeFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
