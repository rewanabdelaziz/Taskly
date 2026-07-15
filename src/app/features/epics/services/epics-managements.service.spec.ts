import { TestBed } from '@angular/core/testing';

import { EpicsManagementsService } from './epics-managements.service';

describe('EpicsManagementsService', () => {
  let service: EpicsManagementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EpicsManagementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
