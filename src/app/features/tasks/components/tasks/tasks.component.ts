import { Component, inject, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [BreadcrumbComponent,IconComponent,FormFieldComponent,SearchInputComponent,ReactiveFormsModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export class TasksComponent implements OnInit{
  private fb = inject(FormBuilder);

  viewForm!: FormGroup

  ngOnInit(): void {
    this.viewForm = this.fb.group({
      view :['board',Validators.required],
    })

  }

  get viewControl() {
    return this.viewForm.get('view') as FormControl;
  }

  onSearchEpics(val : string){
    console.log(val)
  }

}
