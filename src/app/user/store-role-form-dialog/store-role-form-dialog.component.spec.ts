import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StoreRoleFormDialogComponent } from './store-role-form-dialog.component';


describe('StoreRoleFormDialogComponent', () => {
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
