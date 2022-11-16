import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupFormDialogComponent } from './group-form-dialog.component';

describe('GroupFormDialogComponent', () => {
  let component: GroupFormDialogComponent;
  let fixture: ComponentFixture<GroupFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupFormDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
