import { Component } from '@angular/core';
import { TasksStatusColComponent } from '../tasks-status-col/tasks-status-col.component';
import { Status } from '../../models/task';

@Component({
  selector: 'app-board-view',
  standalone: true,
  imports: [TasksStatusColComponent],
  templateUrl: './board-view.component.html',
  styleUrl: './board-view.component.css'
})
export class BoardViewComponent {
 statuses = Object.values(Status);
}
