import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from "@angular/router";
import { ProjectsManagementsService } from '../../services/projects-managements.service';
import { DatePipe } from '@angular/common';
import { Project } from '../../models/projects';
import { boolean } from 'zod';

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


  ngOnInit(): void {
    this.getAllProjects()
  }

  getAllProjects(){
    this.isloading.set(true)
    this.project_managements.getAllProjects().subscribe({
      next: (res:Project[]) =>{
        console.log(res)
        this.isloading.set(false)
        if(res.length == 0){
          this.isEmpty.set(true)
        }
        this.projects.set(res)
        
      },
      error: (err)=>{
        console.log(err)
        this.isloading.set(false)
        this.isError.set(true)
      }
    })
  }


  retry(){
    this.isError.set(false)
    this.getAllProjects()
  }
}
