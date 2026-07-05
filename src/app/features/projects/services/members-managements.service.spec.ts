import { TestBed } from '@angular/core/testing';

import { MembersManagementsService } from './members-managements.service';

describe('MembersManagementsService', () => {
  let service: MembersManagementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MembersManagementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
