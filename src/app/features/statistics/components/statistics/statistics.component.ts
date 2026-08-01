import { Component, inject, OnInit, signal } from '@angular/core';
import { StatisticsService } from '../../services/statistics.service';
import { ToastNotificationService } from '../../../../shared/services/toast-notification.service';
import { CalendarResponse } from '../../models/statistics';
import { Project } from '../../../projects/models/projects';
import { ProjectsManagementsService } from '../../../projects/services/projects-managements.service';
import { HttpResponse } from '@angular/common/http';
import { Status } from '../../../tasks/models/task';
import { StatusLabelPipe } from '../../../tasks/pipes/status-label.pipe';
import { DatePipe, JsonPipe, NgClass } from '@angular/common';
import { CustomDatePickerComponent } from '../../../../shared/components/custom-date-picker/custom-date-picker.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [StatusLabelPipe, DatePipe, NgClass, JsonPipe, CustomDatePickerComponent, IconComponent], 
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent implements OnInit {
  private _statsService = inject(StatisticsService);
  private _toast = inject(ToastNotificationService);
  private project_managements = inject(ProjectsManagementsService);
  
  startDate = signal<string>('');
  endDate = signal<string>('');
  selectedProjectId: string | null = null;
  selectedStatus: string | null = null;
  calendarData = signal<CalendarResponse | null>(null);
  projects = signal<Project[]>([]);
  statuses = Object.values(Status);
  currentDateObj = new Date();

  ngOnInit(): void {
    this.setDefaultCurrentWeek();
    this.getProjects();
    this.getCalendarData();
  }

  getProjects() {
    this.project_managements.getAllProjects().subscribe({
      next: (res: HttpResponse<Project[]>) => {
        this.projects.set(res.body || []);
      },
      error: () => {
        this._toast.showMsg('Failed to fetch projects. Please try again.');
      },
    });
  }

  setDefaultCurrentWeek(): void {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    const start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    this.startDate.set(this.formatDate(start));
    this.endDate.set(this.formatDate(end));
  }

 formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // دالة استقبال النطاق من الـ Custom Date Picker
  changeWeek(range: { startDate: Date; endDate: Date }): void {
    this.startDate.set(this.formatDate(range.startDate));
    this.endDate.set(this.formatDate(range.endDate));
    
    this.getCalendarData();
  }

  onProjectChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedProjectId = val === 'null' ? null : val;
    this.getCalendarData();
  }

  onStatusChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedStatus = val === 'null' ? null : val;
    this.getCalendarData();
  }

  getCalendarData(): void {
    this._statsService.getCalendar(
      this.startDate(),
      this.endDate(),
      this.selectedProjectId,
      this.selectedStatus
    ).subscribe({
      next: (res) => {
        this.calendarData.set(res);
      },
      error: (err) => {
        console.error('Error fetching calendar stats', err);
      }
    });
  }

  isToday(dayString: string): boolean {
    const dayDate = new Date(dayString);
    return dayDate.toDateString() === this.currentDateObj.toDateString();
  }
}