import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {WarehouseReturnListComponent} from './warehouse-return-list.component';


describe('WarehouseReturnListComponent', () => {
  let component: WarehouseReturnListComponent;
  let fixture: ComponentFixture<WarehouseReturnListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseReturnListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseReturnListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
