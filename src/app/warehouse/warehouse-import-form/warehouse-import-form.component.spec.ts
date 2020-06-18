import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseImportFormComponent } from './warehouse-import-form.component';

describe('WarehouseImportFormComponent', () => {
  let component: WarehouseImportFormComponent;
  let fixture: ComponentFixture<WarehouseImportFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarehouseImportFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseImportFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
