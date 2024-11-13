import { Component } from '@angular/core';
import { CalendarComponent } from '../../components/calendar/collab-calendar.component';
@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [CalendarComponent],
  templateUrl: './calendar-page.component.html',
  styleUrl: './calendar-page.component.scss'
})
export class CalendarPageComponent {

}

