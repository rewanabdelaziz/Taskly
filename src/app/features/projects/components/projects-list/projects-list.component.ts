import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from "@angular/router";
import { ProjectsManagementsService } from '../../services/projects-managements.service';
import { DatePipe } from '@angular/common';
import { Project } from '../../models/projects';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [RouterLink,DatePipe],
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.css'
})
export class ProjectsListComponent implements OnInit{

  private project_managements = inject(ProjectsManagementsService)
  projects  = signal <Project[]>([])
  isloading = signal<boolean>(false)
  isEmpty = signal<boolean>(false)
  isError = signal<boolean>(false)
  currentPage = signal(1)
  limit = signal(9)
  offset = computed(()=> (this.currentPage() - 1) * this.limit())
  total = signal(0)
  EndPageNum = computed(()=> Math.ceil(this.total() / this.limit()) || 1)


  ngOnInit(): void {
    this.getProjects()
  }

  getProjects(){
    this.isloading.set(true)
    this.isEmpty.set(false)
    this.isError.set(false)
    this.project_managements.getAllProjects(this.offset(),this.limit()).subscribe({
      next: (res:HttpResponse<Project[]>) =>{
        console.log(res.body)

        this.isloading.set(false)
        this.projects.set(res.body || [])

        if(this.projects().length == 0){
          this.isEmpty.set(true)
        }
        // content tange from header ex: 0-4/5 [(start index - end index) / total num]
        const contentRange = res.headers.get('content-range');
        if (contentRange) {
          const parts = contentRange.split('/');
          const total = parseInt(parts[1])
          this.total.set(total)
        }
        
      },
      error: (err)=>{
        console.log(err)
        this.isloading.set(false)
        this.isError.set(true)
      }
    })
  }

  next(){
    if(this.currentPage()< this.EndPageNum()){
      this.currentPage.update((prev)=> prev+1)
      this.getProjects()
    }
  }
  
  prev(){
    if(this.currentPage()> 1){
      this.currentPage.update((prev)=> prev-1)
      this.getProjects()
    }
  }


  retry(){
    this.isError.set(false)
    this.getProjects()
  }
}
