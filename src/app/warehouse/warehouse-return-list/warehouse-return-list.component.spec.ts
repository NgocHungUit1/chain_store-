import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {WarehouseReturnListComponent} from './warehouse-return-list.component';


describe('WarehouseReturnListComponent', () => {
  let component: WarehouseReturnListComponent;
  let fixture: ComponentFixture<WarehouseReturnListComponent>;

  beforeEach(async(() => {
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
