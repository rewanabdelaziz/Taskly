import { Component, computed, effect, HostListener, inject, signal } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ProjectsManagementsService } from '../../../projects/services/projects-managements.service';
import { RouterLink } from '@angular/router';
import { Epic } from '../../models/epics';
import { DatePipe } from '@angular/common';
import { NameAvatarIconComponent } from "../../../../shared/components/name-avatar-icon/name-avatar-icon.component";
import { EpicPopupComponent } from '../epic-popup/epic-popup.component';
import { CurrentProjectEpicsService } from '../../../../shared/services/current-project-epics.service';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { PaginationService } from '../../../../shared/services/pagination.service';
@Component({
  selector: 'app-epics',
  standalone: true,
  imports: [BreadcrumbComponent, IconComponent, RouterLink, DatePipe, NameAvatarIconComponent,EpicPopupComponent,SearchInputComponent,PaginationComponent],
  providers:[PaginationService],
  templateUrl: './epics.component.html',
  styleUrl: './epics.component.css',
})
export class EpicsComponent {
  private _project_management = inject(ProjectsManagementsService)
   _current_project_epics= inject(CurrentProjectEpicsService)
  _pagination = inject(PaginationService);
  
  currentProject = this._project_management.selectedProject
  epics=this._current_project_epics.epics
  isLoading=this._current_project_epics.isloading
  isEmpty=this._current_project_epics.isEmpty
  isError=this._current_project_epics.isError

  selectedEpic = signal<Epic>({} as Epic)
  isOpenPopUp = signal(false)
  searchTerm = signal('')
 

  currentLength = computed(() => 
    this._pagination.currentLength(this.epics().length)
  )
  endPageNum = computed(() => 
    this._pagination.getEndPageNum(this._current_project_epics.total())
  );


  onPageChange(newPage: number) {
    this._pagination.goToPage(newPage,this._current_project_epics.total());
    this.getEpics();
  }

  isMobileNow = signal<boolean>(false);

  ngOnInit(): void {
    this._pagination.init(3);
    this._current_project_epics.resetState()
    this.getEpics();
    this.checkScreenSize();
    
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.isMobileNow() || this.isLoading() || this._pagination.currentPage() >= this.endPageNum()) return;

    const pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.clientHeight;
    const max = document.documentElement.scrollHeight;

    if (pos >= max - 150) {
      this._pagination.currentPage.update((prev) => prev + 1);
      this.getEpics();
    }
  }

  @HostListener('window:resize', [])
  checkScreenSize() {
    const wasMobile = this.isMobileNow();
    this.isMobileNow.set(window.innerWidth < 640); // sm:640px

    if (wasMobile && !this.isMobileNow()) {
      this._pagination.currentPage.set(1);
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
    this._current_project_epics.getCurrentProjectEpics(this._pagination.offset(),this._pagination.limit(),isAppend,this.searchTerm())

  }


  retry() {
    this.getEpics(this.isMobileNow() && this._pagination.currentPage() > 1);
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

  onSearchEpics(val : string){
    this._pagination.resetPage();
    this.searchTerm.set(val)
    this.getEpics(false);
    // console.log(val)
  }

  

}
