import { TestBed } from '@angular/core/testing';

import { FetchTasksHanlingService } from './fetch-tasks-hanling.service';

describe('FetchTasksHanlingService', () => {
  let service: FetchTasksHanlingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchTasksHanlingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
