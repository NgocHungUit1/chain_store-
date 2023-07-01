import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserTabAuthorizationComponent } from './user-tab-info.component';

describe('UserTabInfoComponent', () => {
  let component: UserTabAuthorizationComponent;
  let fixture: ComponentFixture<UserTabAuthorizationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UserTabAuthorizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTabAuthorizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
