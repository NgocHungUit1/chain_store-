import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelChangeLogComponent } from './document-file.component';

describe('DocumentFileComponent', () => {
  let component: ModelChangeLogComponent;
  let fixture: ComponentFixture<ModelChangeLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelChangeLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelChangeLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
