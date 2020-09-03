import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnsTabInfoComponent } from './returns-tab-info.component';

describe('ReturnsTabInfoComponent', () => {
  let component: ReturnsTabInfoComponent;
  let fixture: ComponentFixture<ReturnsTabInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReturnsTabInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReturnsTabInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
