import { Component } from '@angular/core';
import { WorkingTimeComponent } from '../../components/Working Time/working-time.component';


@Component({
  selector: 'app-working-time-page',
  standalone: true,
  imports: [WorkingTimeComponent],
  templateUrl: './working-time-page.component.html',
  styleUrls: ['./working-time-page.component.scss'],
})
export class WorkingTimePage  {
 }
