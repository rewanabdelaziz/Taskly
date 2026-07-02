import { TestBed } from '@angular/core/testing';

import { ProjectsManagementsService } from './projects-managements.service';

describe('ProjectsManagementsService', () => {
  let service: ProjectsManagementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectsManagementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
