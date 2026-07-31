import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { NameAvatarIconComponent } from '../../../../shared/components/name-avatar-icon/name-avatar-icon.component';
import { SharedMembersService } from '../../../../shared/services/shared-members.service';
import { MembersManagementsService } from '../../services/members-managements.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InviteMemberPopupComponent } from '../invite-member-popup/invite-member-popup.component';
import { PopupService } from '../../../../shared/services/popup.service';


@Component({
  selector: 'app-members',
  standalone: true,
  imports: [IconComponent, BreadcrumbComponent, NameAvatarIconComponent],
  templateUrl: './members.component.html',
  styleUrl: './members.component.css',
})
export class MembersComponent implements OnInit {
  private _members = inject(MembersManagementsService);
  private _activateRoute = inject(ActivatedRoute);
  private _popup = inject(PopupService)
  private destroyRef = inject(DestroyRef);
  _sharedMembers = inject(SharedMembersService)
 
  isloading = this._sharedMembers.isloading
  isEmpty = this._sharedMembers.isEmpty;
  isError = this._sharedMembers.isError;
  

  projectId = signal<string | null>(null);


  ngOnInit(): void {
     this._activateRoute.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params['id'] || null;
      this.projectId.set(id);
      if (id) {
        this._sharedMembers.getMembers(id)
      }
    });
    
  }


  retry() {
    const id = this.projectId();
    if (id) {
      this._sharedMembers.getMembers(id)
    }
  }

  getRoleClass(role: string): string {
    return role === 'owner' 
      ? 'bg-primary-container text-white' 
      : 'bg-badge-member-bg text-text-body';
  }

  openInvitePopup(){
    this._popup.open(InviteMemberPopupComponent,{
      mobilePosition: 'bottom-sheet',
      inputs : {currentProjMembers: this._sharedMembers.members()}  
    })
  }

 
}
