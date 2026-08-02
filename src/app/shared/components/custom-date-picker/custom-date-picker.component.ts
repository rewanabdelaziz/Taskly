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
  monthDays= signal< Date[]>([]);
  isOpen = signal(false);

  currentViewDate = signal(new Date());

  dateRangeSelected = output<{ startDate: Date; endDate: Date }>();

  ngOnInit(): void {
    this.generateCalendarDays();
    this.initDate()
    
  }

  initDate(){
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + 6); //current day number + 6

    this.startDate.set(start);
    this.endDate.set(end);
    // console.log(this.startDate())

    // output the init date
    this.dateRangeSelected.emit({
      startDate: start,
      endDate: end
    });
  }

  toggleDropdown() {
    this.isOpen.set(!this.isOpen()) ;
  }

  generateCalendarDays(calendarRange : number = 21) {
    const viewDate = new Date(this.currentViewDate());
    
    const today = viewDate.getDay();  // 0 - 6 --> sun - sat
    const distanceToMonday = today === 0 ? 6 : today - 1;  // if today sunday --> 6

    const startDateGrid = new Date(viewDate);
    startDateGrid.setDate(viewDate.getDate() - distanceToMonday);

    const days: Date[] = [];

    for (let i = 0; i < calendarRange; i++) {
      const d = new Date(startDateGrid);
      d.setDate(startDateGrid.getDate() + i);
      days.push(d);
    }

    this.monthDays.set(days) ;
  }

  changeCalendarView(event: Event, direction: number, calendarRange : number = 21) {
    event.stopPropagation(); 

    const currentView = new Date(this.currentViewDate());
    currentView.setDate(currentView.getDate() + (direction * calendarRange));
    
    this.currentViewDate.set(currentView);
    this.generateCalendarDays();
  }

  navigateWeek(event: Event, direction: number) {
    event.stopPropagation();

    const currentStart = this.startDate();
    const currentEnd = this.endDate();

    if (!currentStart || !currentEnd) return;

    const newStart = new Date(currentStart);
    newStart.setDate(newStart.getDate() + (direction * 7));

    const newEnd = new Date(currentEnd);
    newEnd.setDate(newEnd.getDate() + (direction * 7));

    this.startDate.set(newStart);
    this.endDate.set(newEnd);

    this.currentViewDate.set(new Date(newStart)) ;
    this.generateCalendarDays();

    this.dateRangeSelected.emit({
      startDate: newStart,
      endDate: newEnd
    });
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
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; //+1 to count the start day itself

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
      const currentTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
      const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
      return currentTime >= startTime && currentTime <= endTime;
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
      this.isOpen.set(false);
    }
  }

  resetRange() {
    this.startDate.set(null);
    this.endDate.set(null);
    this.isOpen.set(false);
    this.initDate()
  }
}