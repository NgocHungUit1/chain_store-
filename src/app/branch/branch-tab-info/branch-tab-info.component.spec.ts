import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchTabInfoComponent } from './branch-tab-info.component';

describe('BranchTabInfoComponent', () => {
  let component: BranchTabInfoComponent;
  let fixture: ComponentFixture<BranchTabInfoComponent>;

  beforeEach(async(() => {
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
