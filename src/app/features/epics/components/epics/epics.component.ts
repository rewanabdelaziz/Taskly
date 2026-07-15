import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ProjectsManagementsService } from '../../../projects/services/projects-managements.service';
import { Router, RouterLink } from '@angular/router';
import { EpicsManagementsService } from '../../services/epics-managements.service';
import { HttpResponse } from '@angular/common/http';
import { Epic } from '../../models/epics';
import { DatePipe } from '@angular/common';
import { NameAvatarIconComponent } from "../../../../shared/components/name-avatar-icon/name-avatar-icon.component";
@Component({
  selector: 'app-epics',
  standalone: true,
  imports: [BreadcrumbComponent, IconComponent, RouterLink, DatePipe, NameAvatarIconComponent, NameAvatarIconComponent],
  templateUrl: './epics.component.html',
  styleUrl: './epics.component.css',
})
export class EpicsComponent {
  private _project_management = inject(ProjectsManagementsService)
  private _epics_management = inject(EpicsManagementsService)
  currentProject = this._project_management.selectedProject
  private _router = inject(Router);
  epics = signal<Epic[]>([]);
  isloading = signal<boolean>(false);
  isEmpty = signal<boolean>(false);
  isError = signal<boolean>(false);
  currentPage = signal(1);
  limit = signal(5);
  offset = computed(() => (this.currentPage() - 1) * this.limit());
  total = signal(0);
  EndPageNum = computed(() => Math.ceil(this.total() / this.limit()) || 1);

  isMobileNow = signal<boolean>(false);

  currentLength = computed(() => {
    if (this.currentPage() === 1) {
      return this.epics().length;
    }
    return this.limit() * (this.currentPage() - 1) + this.epics().length;
  });

  ngOnInit(): void {
    this.getEpics();
    this.checkScreenSize();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.isMobileNow() || this.isloading() || this.currentPage() >= this.EndPageNum()) return;

    const pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.clientHeight;
    const max = document.documentElement.scrollHeight;

    if (pos >= max - 150) {
      this.currentPage.update((prev) => prev + 1);
      this.getEpics(true);
    }
  }

  @HostListener('window:resize', [])
  checkScreenSize() {
    const wasMobile = this.isMobileNow();
    this.isMobileNow.set(window.innerWidth < 640); // sm:640px

    if (wasMobile && !this.isMobileNow()) {
      this.currentPage.set(1);
      this.getEpics(false);
    }
  }

  getEpics(isAppend = false) {
    if (!isAppend) {
      this.isEmpty.set(false);
      this.isloading.set(true);
    }
    this.isError.set(false);
    this._epics_management.getAllEpics(this.offset(), this.limit()).subscribe({
      next: (res: HttpResponse<Epic[]>) => {

        // console.log(res.body)

        this.isloading.set(false);
        if (isAppend) {
          const newProj = res.body || [];
          this.epics.update((prev) => [...prev, ...newProj]);
        } else {
          this.epics.set(res.body || []);
        }

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

  next() {
    if (this.currentPage() < this.EndPageNum()) {
      this.currentPage.update((prev) => prev + 1);
      this.getEpics();
    }
  }

  prev() {
    if (this.currentPage() > 1) {
      this.currentPage.update((prev) => prev - 1);
      this.getEpics();
    }
  }

  retry() {
    this.getEpics(this.isMobileNow() && this.currentPage() > 1);
  }

}
