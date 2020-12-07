import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdCodeFormDialogComponent } from './id-code-form-dialog.component';

describe('IdCodeFormDialogComponent', () => {
  let component: IdCodeFormDialogComponent;
  let fixture: ComponentFixture<IdCodeFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdCodeFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdCodeFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
