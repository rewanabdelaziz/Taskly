import { inject, Injectable, signal } from '@angular/core';
import { ProjectsManagementsService } from '../../features/projects/services/projects-managements.service';
import { EpicsManagementsService } from '../../features/epics/services/epics-managements.service';
import { HttpResponse } from '@angular/common/http';
import { Epic } from '../../features/epics/models/epics';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrentProjectEpicsService {

  private _project_management = inject(ProjectsManagementsService)
  private _epics_management = inject(EpicsManagementsService)
  private currentSub$?: Subscription;

  epics = signal<Epic[]>([]);
  isloading = signal<boolean>(false);
  isEmpty = signal<boolean>(false);
  isError = signal<boolean>(false);
  total = signal(0);

  getCurrentProjectEpics(offset? : number , limit? : number,isAppend?:boolean,searchTerm?:string){
     const projectId=this._project_management.selectedProject()?.id

      if (this.currentSub$) {
        this.currentSub$.unsubscribe();
      }

      this.isError.set(false);

      if(!isAppend){
        this.isloading.set(true)
      }

        this.currentSub$ = this._epics_management.getAllEpics(projectId!,offset,limit,searchTerm).subscribe({
          next: (res: HttpResponse<Epic[]>) => {
    
            this.isloading.set(false);
            if (isAppend) {
              const newEpics = res.body || [];
              this.epics.update((prev) => [...prev, ...newEpics]);
            } else {
              this.epics.set(res.body || []);
              
            }
    
            this.isEmpty.set(this.epics().length === 0);

            // content range from header ex: 0-4/5 [(start index - end index) / total num]
            const contentRange = res.headers.get('content-range');
            if (contentRange) {
              const parts = contentRange.split('/');
              const total = parseInt(parts[1]);
              this.total.set(total);
            }
          },
          error: () => {
            // console.log(err)
            this.isloading.set(false);
            this.isError.set(true);
          },
        });
  }

  resetState() {
    if (this.currentSub$) {
      this.currentSub$.unsubscribe();
    }
    this.epics.set([]);
    this.total.set(0);
    this.isEmpty.set(false);
    this.isError.set(false);
    this.isloading.set(false);
  }
}
