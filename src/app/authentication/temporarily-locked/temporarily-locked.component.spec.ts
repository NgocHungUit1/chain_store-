import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemporarilyLockedComponent } from './temporarily-locked.component';

describe('TemporarilyLockedComponent', () => {
  let component: TemporarilyLockedComponent;
  let fixture: ComponentFixture<TemporarilyLockedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemporarilyLockedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemporarilyLockedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
