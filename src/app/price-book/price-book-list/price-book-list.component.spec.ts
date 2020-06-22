import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceBookListComponent } from './price-book-list.component';

describe('PriceBookListComponent', () => {
  let component: PriceBookListComponent;
  let fixture: ComponentFixture<PriceBookListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PriceBookListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceBookListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
