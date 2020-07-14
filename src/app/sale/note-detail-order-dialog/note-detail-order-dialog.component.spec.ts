import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteDetailOrderDialogComponent } from './note-detail-order-dialog.component';

describe('NoteDetailOrderDialogComponent', () => {
  let component: NoteDetailOrderDialogComponent;
  let fixture: ComponentFixture<NoteDetailOrderDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoteDetailOrderDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoteDetailOrderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
