import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MoveInfoTabComponent } from './move-info-tab.component';

describe('MoveInfoTabComponent', () => {
  let component: MoveInfoTabComponent;
  let fixture: ComponentFixture<MoveInfoTabComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MoveInfoTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveInfoTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
