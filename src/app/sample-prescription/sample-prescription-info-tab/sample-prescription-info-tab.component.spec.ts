import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SamplePrescriptionInfoTabComponent } from './sample-prescription-info-tab.component';

describe('SamplePrescriptionInfoTabComponent', () => {
  let component: SamplePrescriptionInfoTabComponent;
  let fixture: ComponentFixture<SamplePrescriptionInfoTabComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SamplePrescriptionInfoTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SamplePrescriptionInfoTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
