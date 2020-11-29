import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveCreateComponent } from './move-create.component';

describe('MoveCreateComponent', () => {
  let component: MoveCreateComponent;
  let fixture: ComponentFixture<MoveCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoveCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
