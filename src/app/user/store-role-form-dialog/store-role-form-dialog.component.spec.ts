import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StoreRoleFormDialogComponent } from './user-form-dialog.component';

describe('UserFormDialogComponent', () => {
  let component: StoreRoleFormDialogComponent;
  let fixture: ComponentFixture<StoreRoleFormDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreRoleFormDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreRoleFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
