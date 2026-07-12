import { Component, inject, OnDestroy, OnInit, signal, untracked } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Member } from '../../models/members';
import { MembersManagementsService } from '../../services/members-managements.service';
import { Subscription } from 'rxjs';
import { NgClass } from '@angular/common';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { NameAvatarIconComponent } from '../../../../shared/components/name-avatar-icon/name-avatar-icon.component';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [NgClass, RouterLink,IconComponent,BreadcrumbComponent,NameAvatarIconComponent],
  templateUrl: './members.component.html',
  styleUrl: './members.component.css',
})
export class MembersComponent implements OnInit,OnDestroy{
  private _members = inject(MembersManagementsService);
  private _activateRoute = inject(ActivatedRoute)
  members = signal<Member[]>([]);
  isloading = signal<boolean>(false);
  isEmpty = signal<boolean>(false);
  isError = signal<boolean>(false);
  projectId = signal<string | null>(null);
  
  private route$! : Subscription

  ngOnInit(): void {
    this.route$ = this._activateRoute.params.subscribe((params) => {
      const id = params['id'] || null;
      this.projectId.set(id);
      if(id){
        this.getMembers(id)
      }
    })
  }
  

  getMembers(id: string) {
    this.isloading.set(true);
    this.isError.set(false);
    this.isEmpty.set(false);
    this._members.getProjectMembers(id).subscribe({
      next: (res: Member[]) => {
        this.isloading.set(false);
        if (res.length == 0) {
          this.isEmpty.set(true);
        }
        this.members.set(res);
      },
      error: () => {
        this.isloading.set(false);
        this.isError.set(true);
      },
    });
  }

  retry() {
    const id = this.projectId();
    if (id) {
      this.getMembers(id);
    }
  }

  ngOnDestroy(): void {
    if (this.route$) {
      this.route$.unsubscribe();
    }
  }
}
