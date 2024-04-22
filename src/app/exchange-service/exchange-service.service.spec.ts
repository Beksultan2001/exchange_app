import { TestBed } from '@angular/core/testing';

import { ExchangeServiceService } from './exchange-service.service';

describe('ExchangeServiceService', () => {
  let service: ExchangeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExchangeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
