import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseReturnFormComponent } from './warehouse-return-form.component';

describe('WarehouseReturnFormComponent', () => {
  let component: WarehouseReturnFormComponent;
  let fixture: ComponentFixture<WarehouseReturnFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseReturnFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseReturnFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
