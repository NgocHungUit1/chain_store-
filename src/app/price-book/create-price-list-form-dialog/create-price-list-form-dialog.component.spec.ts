import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePriceListFormDialogComponent } from './create-price-list-form-dialog.component';

describe('CreatePriceListFormDialogComponent', () => {
  let component: CreatePriceListFormDialogComponent;
  let fixture: ComponentFixture<CreatePriceListFormDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatePriceListFormDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePriceListFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
