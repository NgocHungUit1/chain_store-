import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReturnsListComponent } from './returns-list.component';

describe('ReturnsListComponent', () => {
  let component: ReturnsListComponent;
  let fixture: ComponentFixture<ReturnsListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReturnsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReturnsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
