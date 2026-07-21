import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProjectsManagementsService } from '../../services/projects-managements.service';
import { DatePipe } from '@angular/common';
import { Project } from '../../models/projects';
import { HttpResponse } from '@angular/common/http';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { PaginationService } from '../../../../shared/services/pagination.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [RouterLink, DatePipe, RouterLink, IconComponent,PaginationComponent],
  providers:[PaginationService],
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.css',
})
export class ProjectsListComponent implements OnInit {
  private project_managements = inject(ProjectsManagementsService);
  private _router = inject(Router);
   _pagination = inject(PaginationService);
  projects = signal<Project[]>([]);
  isloading = signal<boolean>(false);
  isEmpty = signal<boolean>(false);
  isError = signal<boolean>(false);



  total = signal(0);
  currentLength = computed(() => 
    this._pagination.currentLength(this.projects().length)
  )
  endPageNum = computed(() => 
    this._pagination.getEndPageNum(this.total())
  );


  onPageChange(newPage: number) {
    this._pagination.goToPage(newPage,this.total());
    this.getProjects();
  }

  isMobileNow = signal<boolean>(false);



  ngOnInit(): void {
    this._pagination.init(5);
    this.getProjects();
    this.checkScreenSize();
    this.project_managements.clearSelectedProject();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.isMobileNow() || this.isloading() || this._pagination.currentPage() >= this.endPageNum()) return;

    const pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.clientHeight;
    const max = document.documentElement.scrollHeight;

    if (pos >= max - 150) {
      this._pagination.currentPage.update((prev) => prev + 1);
      this.getProjects(true);
    }
  }

  @HostListener('window:resize', [])
  checkScreenSize() {
    const wasMobile = this.isMobileNow();
    this.isMobileNow.set(window.innerWidth < 640); // sm:640px

    if (wasMobile && !this.isMobileNow()) {
      this._pagination.currentPage.set(1);
      this.getProjects(false);
    }
  }

  getProjects(isAppend = false) {
    if (!isAppend) {
      this.isEmpty.set(false);
      this.isloading.set(true);
    }
    this.isError.set(false);
    this.project_managements.getAllProjects(this._pagination.offset(), this._pagination.limit()).subscribe({
      next: (res: HttpResponse<Project[]>) => {
        // console.log(res.body)

        this.isloading.set(false);
        if (isAppend) {
          const newProj = res.body || [];
          this.projects.update((prev) => [...prev, ...newProj]);
        } else {
          this.projects.set(res.body || []);
        }

        if (this.projects().length == 0) {
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



  retry() {
    this.getProjects(this.isMobileNow() && this._pagination.currentPage() > 1);
  }

  goToEpics(id: string, project: Project) {
    this.project_managements.setSelectedProject(project);
    this._router.navigate([`/project/${id}/epics`]);
  }
}
