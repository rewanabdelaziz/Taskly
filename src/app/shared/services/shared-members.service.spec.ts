import { TestBed } from '@angular/core/testing';

import { SharedMembersService } from './shared-members.service';

describe('SharedMembersService', () => {
  let service: SharedMembersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedMembersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
