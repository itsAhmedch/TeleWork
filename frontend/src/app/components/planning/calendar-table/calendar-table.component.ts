import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import moment from 'moment';
import { CalendarService } from './calendar.service';
import { EmployeesListComponent } from '../employees-list/employees-list.component';
import { planService } from '../../../services/plan.service';

// Interface for the calendar day structure
interface CalendarDay {
  date: moment.Moment;
  isWeekend: boolean;
}

// Interface for Employee
interface Employee {
  id: number;
  fullname: string;
}

// Interface for Form Working Dates
interface WorkingDate {
  Id: number; // Use Id instead of formId
  dates: string; // Change dates to string
}

@Component({
  selector: 'app-calendar-table',
  standalone: true, // Make this a standalone component
  imports: [CommonModule, EmployeesListComponent], // Import necessary Angular directives
  templateUrl: './calendar-table.component.html',
  styleUrls: ['./calendar-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // Improves performance by checking only changed values
})
export class CalendarTableComponent {
  currentDate = moment(); // Current date for the calendar
  daysInMonth: CalendarDay[] = []; // Array of days in the current month
  daysInWeek: CalendarDay[] = []; // Array of days in the current week
  monthYearLabel = ''; // Label for the current month
  weekLabel = ''; // Label for the current week
  currentWeekIndex = 0; // Index to track the current week
  employees: Employee[] = [];
  workingDates: WorkingDate[] = this.initializeWorkingDates(); // Initialize working dates
  planChanges: { Id: number; dates: string; action: string }[] = []; // Track plan changes
  respoId: number = -1;
  teamIds:number[]=[]
  constructor(
    private calendarService: CalendarService,
    private planService: planService,
    private cdRef: ChangeDetectorRef
  ) {
    this.generateMonth(); // Generate the initial month
    this.generateWeek(); // Generate the initial week
  }

  // Create a getter to expose moment to the template
  get moment() {
    return moment;
  }

  // Use @HostListener to detect window resize and adjust mobile mode
  @HostListener('window:resize')
  onResize() {
    this.generateMonth(); // Regenerate month when screen size changes
  }
  @Output() PlanChangesEvent = new EventEmitter<
    { Id: number; dates: string; action: string }[]
  >();
  @Input() set employeeList(employees: Employee[]) {
    this.employees = employees;
  }
  // Initialize working dates
  private initializeWorkingDates(): WorkingDate[] {
    return [
      { Id: 1, dates: '2024-10-14' },
      { Id: 2, dates: '2024-10-15' },
      { Id: 3, dates: '2024-10-16' },
      { Id: 2, dates: '2024-10-16' },
      { Id: 1, dates: '2024-10-21' },
    ];
  }

  handleEmployees(employees: any) {
    this.employees = employees;
  }
  // Generate the month
  private generateMonth(): void {
    this.daysInMonth = this.calendarService.getDaysInMonth(this.currentDate);
    this.monthYearLabel = this.currentDate.format('MMMM YYYY'); // Update month year label
  }

  // Generate the week for the current index
  private generateWeek(): void {
    this.daysInWeek = this.calendarService.getDaysInWeek(
      this.currentDate.clone(),
      this.currentWeekIndex
    );
    this.weekLabel = `${this.currentDate
      .clone()
      .startOf('week')
      .add(1, 'days')
      .format('MMM DD')} - ${this.currentDate
      .clone()
      .startOf('week')
      .add(5, 'days')
      .format('MMM DD')}`;
  }

  // Navigate to the previous month
  prevMonth(): void {
    this.currentDate.subtract(1, 'month');
    this.generateMonth(); // Regenerate the month view
  }

  // Navigate to the next month
  nextMonth(): void {
    this.currentDate.add(1, 'month');
    this.generateMonth(); // Regenerate the month view
  }

  // Navigate to the previous week
  prevWeek(): void {
    this.currentWeekIndex = Math.max(this.currentWeekIndex - 1, 0); // Prevent going below index 0
    this.generateWeek(); // Generate the week view
    this.updateWeekLabel(); // Update the week label dynamically
  }

  // Navigate to the next week
  nextWeek(): void {
    this.currentWeekIndex++;
    this.generateWeek(); // Generate the week view
    this.updateWeekLabel(); // Update the week label dynamically
  }

  // Update week label based on current week index
  updateWeekLabel(): void {
    const startOfWeek = this.currentDate
      .clone()
      .startOf('week')
      .add(this.currentWeekIndex, 'weeks');
    this.weekLabel = `${startOfWeek
      .clone()
      .add(1, 'days')
      .format('MMM DD')} - ${startOfWeek
      .clone()
      .add(5, 'days')
      .format('MMM DD')}`;
  }

  // Check if the day is chosen for the given employee and date
  isChoosingDay(employeeId: number, date: moment.Moment): boolean {
    const hasExistingWorkDay = this.workingDates.some(
      (workingDate) =>
        workingDate.Id === employeeId &&
        moment(workingDate.dates).isSame(date, 'day')
    );

    const hasAction = this.planChanges.some(
      (workingDate) =>
        workingDate.Id === employeeId &&
        moment(workingDate.dates).isSame(date, 'day')
    );

    return hasAction
      ? !this.planChanges.find(
          (change) =>
            change.Id === employeeId &&
            moment(change.dates).isSame(date, 'day') &&
            change.action === 'delete'
        )
      : hasExistingWorkDay;
  }

  // Toggle shift for the employee on a specific date
  toggleShift(employeeId: number, date: moment.Moment): void {
    const dateStr = date.format('YYYY-MM-DD');
    const existingChangeIndex = this.planChanges.findIndex(
      (change) => change.Id === employeeId && change.dates === dateStr
    );

    if (existingChangeIndex >= 0) {
      this.planChanges.splice(existingChangeIndex, 1); // Remove existing change
    } else {
      const existingInWorksDates = this.workingDates.find(
        (change) => change.Id === employeeId && change.dates === dateStr
      );
      this.planChanges.push({
        Id: employeeId,
        dates: dateStr,
        action: existingInWorksDates ? 'delete' : 'add',
      });
    }

    console.log(this.planChanges);
  }

  // Reset to the current date
  resetToCurrentDate(): void {
    this.currentDate = moment(); // Reset current date to today's date
    this.currentWeekIndex = 0; // Reset the current week index
    this.generateMonth(); // Regenerate the month view
    this.generateWeek(); // Regenerate the week view
  }

  savePlans() {
    this.planService
      .savePlan(this.respoId, this.planChanges)
      .subscribe(() => {
        console.log(this.planChanges,"rrrrrrrrr");
        this.workingDates=[...this.workingDates,...this.planChanges]
        this.planChanges = [];
        console.log(this.planChanges);
        this.cdRef.detectChanges();
      });
  }
  
  showProposal() {}

  getRespoId(id: number) {
    this.respoId = id;
    console.log('Received Respo ID:', this.respoId); // Debug log
  }
  getWorkingDays(workingDays:any){
    console.log(workingDays,'fffffffffffffff');
    
    this.workingDates=[this.workingDates,...workingDays]
    this.cdRef.detectChanges();
  }
}
