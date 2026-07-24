import { Component, inject, OnInit, signal } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { ReactiveFormsModule, } from '@angular/forms';
import { BoardViewComponent } from '../board-view/board-view.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectsManagementsService } from '../../../projects/services/projects-managements.service';
import { ListViewComponent } from '../list-view/list-view.component';

type ViewMode = 'board' | 'list';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [BreadcrumbComponent,IconComponent,BoardViewComponent,SearchInputComponent,ReactiveFormsModule,ListViewComponent],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export class TasksComponent implements OnInit{
  private _activate_router = inject(ActivatedRoute)
  private _router = inject(Router)
  private _project_management = inject(ProjectsManagementsService)
  currentView = signal<ViewMode>('board');

  ngOnInit(): void {
    this._activate_router.queryParams.subscribe((params) =>{
      const view = params['view'] as ViewMode;

      if(view === 'board' || view === 'list'){
        this.currentView.set(view);
      }else{
        this.currentView.set('board');
      }
    }
      
  )

  }


  onSearchEpics(val : string){
    console.log(val)
  }

  onViewChange(event: Event) {
  const selectedValue = (event.target as HTMLSelectElement).value as ViewMode;
  this._router.navigate(['/project', this._project_management.selectedProject()!.id, 'tasks'], {
      queryParams: { view: selectedValue }
  })
  }

}
