import { TestBed } from '@angular/core/testing';

import { PaySlipService } from './pay-slip.service';

describe('PaySlipService', () => {
  let service: PaySlipService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaySlipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
