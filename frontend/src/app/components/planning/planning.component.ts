import { Component } from '@angular/core';
import { CalendarTableComponent } from './calendar-table/calendar-table.component';
import { EmployeesListComponent } from './employees-list/employees-list.component';





@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CalendarTableComponent,EmployeesListComponent],
  templateUrl: './planning.component.html',
  styleUrl: './planning.component.scss'
})
export class PlanningComponent {
  employees = [];

  handleEmployees(employees: any) {
    this.employees = employees;
  }

}





