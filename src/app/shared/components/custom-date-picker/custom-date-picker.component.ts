import { Component, inject, OnInit, output, signal } from '@angular/core';
import { ToastNotificationService } from '../../services/toast-notification.service';
import { DatePipe } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-custom-date-picker',
  standalone: true,
  imports: [DatePipe, IconComponent],
  templateUrl: './custom-date-picker.component.html',
  styleUrl: './custom-date-picker.component.css'
})
export class CustomDatePickerComponent implements OnInit {
  private _toast = inject(ToastNotificationService);
  
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);
  monthDays: Date[] = [];
  isOpen: boolean = false;

  currentViewDate = new Date();

  dateRangeSelected = output<{ startDate: Date; endDate: Date }>();

  ngOnInit(): void {
    this.generateMonthDays();
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  generateMonthDays() {
    const year = this.currentViewDate.getFullYear();
    const month = this.currentViewDate.getMonth();

    const lastDayOfMonth = new Date(year, month + 1, 0);

    const days: Date[] = [];
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    this.monthDays = days;
  }

  changeMonth(event: Event, direction: number) {
    event.stopPropagation(); 
    
    const year = this.currentViewDate.getFullYear();
    const month = this.currentViewDate.getMonth();
    
    this.currentViewDate = new Date(year, month + direction, 1);
    this.generateMonthDays();
  }
  
  selectDate(date: Date) {
    const start = this.startDate();
    const end = this.endDate();

   
    if (!start || (start && end)) {
      this.startDate.set(date);
      this.endDate.set(null); 
    } 
  
    else if (start && !end) {
      if (date < start) {
        // if the selected date is before the start date, reset the start date
        this.startDate.set(date);
      } else {
        // range selected days
        const diffTime = Math.abs(date.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (diffDays <= 7) {
          this.endDate.set(date);
        } else {
          this._toast.showMsg('Max range allowed is 7 days');
        }
      }
    }
  }

  isSameDay(d1: Date | null, d2: Date | null): boolean {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  isInRange(date: Date): boolean {
    const start = this.startDate();
    const end = this.endDate();
    
    if (start && end) {
      const time = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
      const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
      return time >= startTime && time <= endTime;
    }
    return false;
  }

  applyRange() {
    const start = this.startDate();
    const end = this.endDate();

    if (start) {
      if (end) {
        this.dateRangeSelected.emit({
          startDate: start,
          endDate: end
        });
      } else {
      //  default 7 days range if end date is not selected
        const calculatedEnd = new Date(start.getTime() + (6 * 24 * 60 * 60 * 1000));
        this.endDate.set(calculatedEnd);
        this.dateRangeSelected.emit({
          startDate: start,
          endDate: calculatedEnd
        });
      }
      this.isOpen = false;
    }
  }

  resetRange() {
    this.startDate.set(null);
    this.endDate.set(null);
    this.isOpen = false;
  }
}