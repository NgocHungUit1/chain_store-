import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupTabInfoComponent } from './group-tab-info.component';

describe('GroupTabInfoComponent', () => {
  let component: GroupTabInfoComponent;
  let fixture: ComponentFixture<GroupTabInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupTabInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupTabInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
