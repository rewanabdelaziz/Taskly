import { inject, Injectable, signal } from '@angular/core';
import { Member } from '../../features/projects/models/members';
import { MembersManagementsService } from '../../features/members/services/members-managements.service';

@Injectable({
  providedIn: 'root'
})
export class SharedMembersService {
  private _members = inject(MembersManagementsService);

  members = signal<Member[]>([]);
  isloading = signal<boolean>(false);
  isEmpty = signal<boolean>(false);
  isError = signal<boolean>(false);

  getMembers(id: string){
   if(this.members().length ===0){
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
  }

}
