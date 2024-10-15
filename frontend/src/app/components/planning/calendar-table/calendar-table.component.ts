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
  cin:number
}

// Interface for Form Working Dates
interface WorkingDate {
  CollabId: number; // Use CollabId instead of formId
  date: string; // Change date to string
  action?: string;
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
  workingDates: WorkingDate[] = [];
  planChanges: { CollabId: number; date: string; action: string }[] = []; // Track plan changes
  respoId: number = -1;
  teamIds: number[] = [];
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
    { CollabId: number; date: string; action: string }[]
  >();
  @Input() set employeeList(employees: Employee[]) {
    this.employees = employees;
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

  formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero if needed
    const day = date.getDate().toString().padStart(2, '0'); // Add leading zero if needed
    return `${year}-${month}-${day}`;
  }

  // Check if the day is chosen for the given employee and date
  isChoosingDay(employeeId: number, date: moment.Moment): boolean {
    const formattedDate = this.formatDateToYYYYMMDD(date.toDate());

    const hasExistingWorkDay = this.workingDates.some(
      (workingDate) =>
        workingDate.CollabId === employeeId &&
        workingDate.date === formattedDate
    );

    const hasAction = this.planChanges.some(
      (workingDate) =>
        workingDate.CollabId === employeeId &&
        moment(workingDate.date).isSame(date, 'day')
    );

    return hasAction
      ? !this.planChanges.find(
          (change) =>
            change.CollabId === employeeId &&
            moment(change.date).isSame(date, 'day') &&
            change.action === 'delete'
        )
      : hasExistingWorkDay;
  }

  // Toggle shift for the employee on a specific date
  toggleShift(employeeId: number, date: moment.Moment): void {
    const dateStr = this.formatDateToYYYYMMDD(date.toDate());

    // Find if there's already an action for this employee and date in planChanges
    const existingIndexChanges = this.planChanges.findIndex(
      (change) => change.CollabId === employeeId && change.date === dateStr
    );

    // Find if this date is already in workingDates
    const existingWorkingIndex = this.workingDates.findIndex(
      (change) => change.CollabId === employeeId && change.date === dateStr
    );

    // If the shift exists in workingDates (already assigned)
    if (existingWorkingIndex !== -1) {
      // Remove the shift from workingDates
      this.workingDates.splice(existingWorkingIndex, 1);

      // Remove existing 'add' action if present, or add 'delete' action
      if (
        existingIndexChanges !== -1 &&
        this.planChanges[existingIndexChanges].action === 'add'
      ) {
        // Remove 'add' action from planChanges to avoid duplication
        this.planChanges.splice(existingIndexChanges, 1);
      } else if (existingIndexChanges === -1) {
        // If no entry exists in planChanges, add 'delete' action
        this.planChanges.push({
          CollabId: employeeId,
          date: dateStr,
          action: 'delete',
        });
      } else if (this.planChanges[existingIndexChanges].action !== 'add') {
        // Update existing entry's action to 'delete' if it's not 'add'
        this.planChanges[existingIndexChanges].action = 'delete';
      }
    } else {
      // If the shift is not in workingDates, add it
      this.workingDates.push({
        CollabId: employeeId,
        date: dateStr,
      });

      // If 'delete' action already exists, remove it, else add 'add' action
      if (
        existingIndexChanges !== -1 &&
        this.planChanges[existingIndexChanges].action === 'delete'
      ) {
        // Remove 'delete' action from planChanges to revert the deletion
        this.planChanges.splice(existingIndexChanges, 1);
      } else if (existingIndexChanges === -1) {
        // Add 'add' action to planChanges if no action exists
        this.planChanges.push({
          CollabId: employeeId,
          date: dateStr,
          action: 'add',
        });
      }
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
    this.planService.savePlan(this.respoId, this.planChanges).subscribe(() => {
      this.planChanges = [];
      console.log(this.workingDates, 'ddddddddddddddddddddddd');
      this.cdRef.detectChanges();
    });
  }

  showProposal() {}

  getRespoId(id: number) {
    this.respoId = id;
    console.log('Received Respo ID:', this.respoId); // Debug log
  }
  getWorkingDays(workingDays: any) {
    console.log(workingDays, 'fffffffffffffff');

    this.workingDates = [this.workingDates, ...workingDays];
    this.cdRef.detectChanges();
  }
}
