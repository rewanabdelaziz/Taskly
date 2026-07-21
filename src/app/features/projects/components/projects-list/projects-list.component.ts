import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProjectsManagementsService } from '../../services/projects-managements.service';
import { DatePipe } from '@angular/common';
import { Project } from '../../models/projects';
import { HttpResponse } from '@angular/common/http';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [RouterLink, DatePipe, RouterLink, IconComponent,PaginationComponent],
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.css',
})
export class ProjectsListComponent implements OnInit {
  private project_managements = inject(ProjectsManagementsService);
  private _router = inject(Router);
  projects = signal<Project[]>([]);
  isloading = signal<boolean>(false);
  isEmpty = signal<boolean>(false);
  isError = signal<boolean>(false);

  currentPage = signal(1);
  limit = signal(5);
  offset = computed(() => (this.currentPage() - 1) * this.limit());
  total = signal(0);
  EndPageNum = computed(() => Math.ceil(this.total() / this.limit()) || 1);

  currentLength = computed(() => {
    if (this.currentPage() === 1) {
      return this.projects().length;
    }
    return this.limit() * (this.currentPage() - 1) + this.projects().length;
  });

  isMobileNow = signal<boolean>(false);

  onPageChange(newPage: number) {
    this.currentPage.set(newPage);
    this.getProjects();
  }

  ngOnInit(): void {
    this.getProjects();
    this.checkScreenSize();
    this.project_managements.clearSelectedProject();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.isMobileNow() || this.isloading() || this.currentPage() >= this.EndPageNum()) return;

    const pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.clientHeight;
    const max = document.documentElement.scrollHeight;

    if (pos >= max - 150) {
      this.currentPage.update((prev) => prev + 1);
      this.getProjects(true);
    }
  }

  @HostListener('window:resize', [])
  checkScreenSize() {
    const wasMobile = this.isMobileNow();
    this.isMobileNow.set(window.innerWidth < 640); // sm:640px

    if (wasMobile && !this.isMobileNow()) {
      this.currentPage.set(1);
      this.getProjects(false);
    }
  }

  getProjects(isAppend = false) {
    if (!isAppend) {
      this.isEmpty.set(false);
      this.isloading.set(true);
    }
    this.isError.set(false);
    this.project_managements.getAllProjects(this.offset(), this.limit()).subscribe({
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
    this.getProjects(this.isMobileNow() && this.currentPage() > 1);
  }

  goToEpics(id: string, project: Project) {
    this.project_managements.setSelectedProject(project);
    this._router.navigate([`/project/${id}/epics`]);
  }
}
