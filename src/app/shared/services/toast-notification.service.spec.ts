import { TestBed } from '@angular/core/testing';

import { GlobalErrorMessageService } from './toast-notification.service';

describe('GlobalErrorMessageService', () => {
  let service: GlobalErrorMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalErrorMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
