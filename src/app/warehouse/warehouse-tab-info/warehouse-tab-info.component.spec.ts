import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseTabInfoComponent } from './warehouse-tab-info.component';

describe('WarehouseTabInfoComponent', () => {
  let component: WarehouseTabInfoComponent;
  let fixture: ComponentFixture<WarehouseTabInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseTabInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseTabInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
