import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({

  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  
})
export class CalendarComponent {
  currentMonth: Date;
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dates: Date[] = [];
  displayMonths: number = 1; // Number of months to display at once
  showWeekNumbers: boolean = false; // Show week numbers
  outsideDays: 'visible' | 'hidden' | 'collapsed' = 'visible'; // Behavior of outside days

  constructor() {
    this.currentMonth = new Date();
    this.updateCalendar();
  }

  updateCalendar() {
    const startOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const endOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
    const daysInMonth = endOfMonth.getDate();

    this.dates = [];
    for (let i = 1; i <= daysInMonth; i++) {
      this.dates.push(new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), i));
    }
  }

  prevMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.updateCalendar();
  }

  nextMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.updateCalendar();
  }

  getWeekNumber(date: Date): number {
    const startDate = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.valueOf() - startDate.valueOf()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startDate.getDay() + 1) / 7);
  }
}
