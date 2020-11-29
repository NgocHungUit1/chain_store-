import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StockTakeCreateComponent } from './stock-take-create.component';

describe('StockTakeCreateComponent', () => {
  let component: StockTakeCreateComponent;
  let fixture: ComponentFixture<StockTakeCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StockTakeCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StockTakeCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
