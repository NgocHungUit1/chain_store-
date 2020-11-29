import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveInfoTabComponent } from './move-info-tab.component';

describe('MoveInfoTabComponent', () => {
  let component: MoveInfoTabComponent;
  let fixture: ComponentFixture<MoveInfoTabComponent>;

  beforeEach(async(() => {
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
