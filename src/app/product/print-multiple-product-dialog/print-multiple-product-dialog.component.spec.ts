import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintMutipleProductDialogComponent } from './id-code-form-dialog.component';

describe('IdCodeFormDialogComponent', () => {
  let component: PrintMutipleProductDialogComponent;
  let fixture: ComponentFixture<PrintMutipleProductDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintMutipleProductDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintMutipleProductDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
