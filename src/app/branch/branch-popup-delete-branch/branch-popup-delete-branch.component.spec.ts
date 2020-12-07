import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BranchPopupDeleteBranchComponent } from './branch-popup-delete-branch.component';

describe('BranchPopupDeleteBranchComponent', () => {
  let component: BranchPopupDeleteBranchComponent;
  let fixture: ComponentFixture<BranchPopupDeleteBranchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BranchPopupDeleteBranchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BranchPopupDeleteBranchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
