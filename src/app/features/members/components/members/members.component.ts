import { Component, DestroyRef, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { NameAvatarIconComponent } from '../../../../shared/components/name-avatar-icon/name-avatar-icon.component';
import { SharedMembersService } from '../../../../shared/services/shared-members.service';
import { MembersManagementsService } from '../../services/members-managements.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [NgClass, RouterLink, IconComponent, BreadcrumbComponent, NameAvatarIconComponent],
  templateUrl: './members.component.html',
  styleUrl: './members.component.css',
})
export class MembersComponent implements OnInit {
  private _members = inject(MembersManagementsService);
  private _activateRoute = inject(ActivatedRoute);
  _sharedMembers = inject(SharedMembersService)
  isloading = this._sharedMembers.isloading
  isEmpty = this._sharedMembers.isEmpty;
  isError = this._sharedMembers.isError;
  private destroyRef = inject(DestroyRef);

  projectId = signal<string | null>(null);

  private route$!: Subscription;

  ngOnInit(): void {
    this.route$ = this._activateRoute.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
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

  // ngOnDestroy(): void {
  //   if (this.route$) {
  //     this.route$.unsubscribe();
  //   }
  // }
}
