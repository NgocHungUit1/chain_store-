import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchPopupDeleteBranchComponent } from './branch-popup-delete-branch.component';

describe('BranchPopupDeleteBranchComponent', () => {
  let component: BranchPopupDeleteBranchComponent;
  let fixture: ComponentFixture<BranchPopupDeleteBranchComponent>;

  beforeEach(async(() => {
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
