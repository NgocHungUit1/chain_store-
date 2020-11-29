import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SamplePrescriptionCreateComponent } from './sample-prescription-item-create.component';

describe('SamplePrescriptionCreateComponent', () => {
  let component: SamplePrescriptionCreateComponent;
  let fixture: ComponentFixture<SamplePrescriptionCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SamplePrescriptionCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SamplePrescriptionCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
