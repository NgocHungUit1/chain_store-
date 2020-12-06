import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserTabInfoComponent } from './user-tab-info.component';

describe('UserTabInfoComponent', () => {
  let component: UserTabInfoComponent;
  let fixture: ComponentFixture<UserTabInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UserTabInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTabInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
