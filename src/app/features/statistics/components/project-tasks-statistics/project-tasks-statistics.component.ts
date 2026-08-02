import { Component, inject, input, OnInit, signal } from '@angular/core';
import { TasksCountPerProjectRes } from '../../models/statistics';
import { StatisticsService } from '../../services/statistics.service';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';

@Component({
  selector: 'app-project-tasks-statistics',
  standalone: true,
  imports: [],
  templateUrl: './project-tasks-statistics.component.html',
  styleUrl: './project-tasks-statistics.component.css'
})
export class ProjectTasksStatisticsComponent{
  private _statistics = inject(StatisticsService)
  private _toast = inject(ToastNotificationService)
  projects = input.required<TasksCountPerProjectRes[]>();


 


}
