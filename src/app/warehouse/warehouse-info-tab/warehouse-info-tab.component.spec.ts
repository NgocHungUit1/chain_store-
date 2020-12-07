import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WarehouseInfoTabComponent } from './warehouse-info-tab.component';

describe('WarehouseInfoTabComponent', () => {
  let component: WarehouseInfoTabComponent;
  let fixture: ComponentFixture<WarehouseInfoTabComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseInfoTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseInfoTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
