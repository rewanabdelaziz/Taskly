import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteMemberPopupComponent } from './invite-member-popup.component';

describe('InviteMemberPopupComponent', () => {
  let component: InviteMemberPopupComponent;
  let fixture: ComponentFixture<InviteMemberPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InviteMemberPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InviteMemberPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
