import { Component } from '@angular/core';
import { PlanningComponent } from '../../components/planning/planning.component';

@Component({
  selector: 'app-planning-page',
  standalone: true,
  imports: [PlanningComponent],
  templateUrl: './planning-page.component.html',
  styleUrl: './planning-page.component.scss'
})
export class PlanningPageComponent {
 
}
