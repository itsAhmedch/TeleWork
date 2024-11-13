import { Injectable } from '@angular/core';
import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  // Get days for a specific month
  getDaysInMonth(
    date: moment.Moment
  ): Array<{ date: moment.Moment; isWeekend: boolean }> {
    const daysInMonth = [];
    const startOfMonth = date.clone().startOf('month');
    const endOfMonth = date.clone().endOf('month');
  
    // Loop through all days of the month, including the last day
    for (
      let day = startOfMonth;
      day.isSameOrBefore(endOfMonth, 'day'); // Use isSameOrBefore to include the last day
      day.add(1, 'days')
    ) {
      daysInMonth.push({
        date: day.clone(),
        isWeekend: day.day() === 6 || day.day() === 0, // Check if the day is a weekend
      });
    }
  
    return daysInMonth;
  }
  
  // Get days for a specific week based on index
  getDaysInWeek(
    date: moment.Moment,
    weekIndex: number
  ): Array<{ date: moment.Moment; isWeekend: boolean }> {
    const daysInWeek = [];
    const startOfWeek = date.clone().startOf('week').add(weekIndex, 'weeks'); // Calculate the start of the week based on the index

    // Loop through Monday to Friday
    for (let i = 1; i <= 5; i++) {
      const day = startOfWeek.clone().add(i, 'days');
      daysInWeek.push({
        date: day.clone(),
        isWeekend: day.day() === 6 || day.day() === 0, // Check if the day is a weekend
      });
    }

    return daysInWeek;
  }

}
