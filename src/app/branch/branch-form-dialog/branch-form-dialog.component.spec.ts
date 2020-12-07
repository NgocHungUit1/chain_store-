import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BranchFormDialogComponent } from './branch-form-dialog.component';

describe('BranchFormDialogComponent', () => {
  let component: BranchFormDialogComponent;
  let fixture: ComponentFixture<BranchFormDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BranchFormDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BranchFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
