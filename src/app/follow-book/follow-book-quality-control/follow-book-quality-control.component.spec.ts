import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowBookQualityControlComponent } from './follow-book-quality-control.component';

describe('FollowBookQualityControlComponent', () => {
  let component: FollowBookQualityControlComponent;
  let fixture: ComponentFixture<FollowBookQualityControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FollowBookQualityControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FollowBookQualityControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
