import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BranchTabInfoComponent } from './branch-tab-info.component';

describe('BranchTabInfoComponent', () => {
  let component: BranchTabInfoComponent;
  let fixture: ComponentFixture<BranchTabInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BranchTabInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BranchTabInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
