import { TestBed } from '@angular/core/testing';

import { CurrentProjectEpicsService } from './current-project-epics.service';

describe('CurrentProjectEpicsService', () => {
  let service: CurrentProjectEpicsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrentProjectEpicsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
