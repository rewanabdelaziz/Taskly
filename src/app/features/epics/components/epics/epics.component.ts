import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ProjectsManagementsService } from '../../../projects/services/projects-managements.service';
import { RouterLink } from '@angular/router';
import { Epic } from '../../models/epics';
import { DatePipe } from '@angular/common';
import { NameAvatarIconComponent } from "../../../../shared/components/name-avatar-icon/name-avatar-icon.component";
import { EpicPopupComponent } from '../epic-popup/epic-popup.component';
import { CurrentProjectEpicsService } from '../../../../shared/services/current-project-epics.service';
@Component({
  selector: 'app-epics',
  standalone: true,
  imports: [BreadcrumbComponent, IconComponent, RouterLink, DatePipe, NameAvatarIconComponent,EpicPopupComponent],
  templateUrl: './epics.component.html',
  styleUrl: './epics.component.css',
})
export class EpicsComponent {
  private _project_management = inject(ProjectsManagementsService)
  private _current_project_epics= inject(CurrentProjectEpicsService)
  
  currentProject = this._project_management.selectedProject
  epics=this._current_project_epics.epics
  isLoading=this._current_project_epics.isloading
  isEmpty=this._current_project_epics.isEmpty
  isError=this._current_project_epics.isError

  selectedEpic = signal<Epic>({} as Epic)
  isOpenPopUp = signal(false)

  currentPage = signal(1);
  limit = signal(3);
  offset = computed(() => (this.currentPage() - 1) * this.limit());
  total = this._current_project_epics.total
  EndPageNum = computed(() => Math.ceil(this.total() / this.limit()) || 1);

  isMobileNow = signal<boolean>(false);


  currentLength = computed(() => {
    if (this.currentPage() === 1) {
      return this.epics().length;
    }
    return this.limit() * (this.currentPage() - 1) + this.epics().length;
  });

  ngOnInit(): void {
    this._current_project_epics.resetState()
    this.getEpics();
    this.checkScreenSize();
    
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.isMobileNow() || this.isLoading() || this.currentPage() >= this.EndPageNum()) return;

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
      this.isLoading.set(true);
    }
    this.isError.set(false);
    // const projectId=this._project_management.selectedProject()?.id
    this._current_project_epics.getCurrentProjectEpics(this.offset(),this.limit(),isAppend)

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

  setSelectedEpic(epic: Epic){
    this.selectedEpic.set(epic)
    this.isOpenPopUp.set(true)
    document.body.classList.add('overflow-hidden');
  }

  handleClose(){
    this.isOpenPopUp.set(false)
    document.body.classList.remove('overflow-hidden');
    this.getEpics();
  }

}
