import { inject, Injectable, signal } from '@angular/core';
import { ProjectsManagementsService } from '../../features/projects/services/projects-managements.service';
import { EpicsManagementsService } from '../../features/epics/services/epics-managements.service';
import { HttpResponse } from '@angular/common/http';
import { Epic } from '../../features/epics/models/epics';

@Injectable({
  providedIn: 'root'
})
export class CurrentProjectEpicsService {

  private _project_management = inject(ProjectsManagementsService)
  private _epics_management = inject(EpicsManagementsService)
  epics = signal<Epic[]>([]);
  isloading = signal<boolean>(false);
  isEmpty = signal<boolean>(false);
  isError = signal<boolean>(false);
  total = signal(0);

  getCurrentProjectEpics(offset? : number , limit? : number,isAppend?:boolean){
    // console.log(...arguments)
     const projectId=this._project_management.selectedProject()?.id
        this._epics_management.getAllEpics(projectId!,offset,limit,).subscribe({
          next: (res: HttpResponse<Epic[]>) => {
    
            this.isloading.set(false);
            if (isAppend) {
              const newProj = res.body || [];
              this.epics.update((prev) => [...prev, ...newProj]);
            } else {
              this.epics.set(res.body || []);
            }
            // console.log(res.body)
    
            if (this.epics().length == 0) {
              this.isEmpty.set(true);
            }
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
    this.epics.set([]);
    this.total.set(0);
    this.isEmpty.set(false);
    this.isError.set(false);
    this.isloading.set(false);
  }
}
