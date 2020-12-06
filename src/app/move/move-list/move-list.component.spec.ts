import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MoveListComponent } from './move-list.component';

describe('MoveListComponent', () => {
  let component: MoveListComponent;
  let fixture: ComponentFixture<MoveListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MoveListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
