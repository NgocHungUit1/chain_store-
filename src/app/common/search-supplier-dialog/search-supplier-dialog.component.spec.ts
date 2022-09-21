import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchSupplierDialogComponent } from './search-supplier-dialog.component';

describe('SearchSupplierDialogComponent', () => {
  let component: SearchSupplierDialogComponent;
  let fixture: ComponentFixture<SearchSupplierDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchSupplierDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchSupplierDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
