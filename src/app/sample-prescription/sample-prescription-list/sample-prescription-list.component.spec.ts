import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SamplePrescriptionListComponent } from './sample-prescription-list.component';

describe('SamplePrescriptionListComponent', () => {
  let component: SamplePrescriptionListComponent;
  let fixture: ComponentFixture<SamplePrescriptionListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SamplePrescriptionListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SamplePrescriptionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
