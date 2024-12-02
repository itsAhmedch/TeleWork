import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import moment from 'moment';
import { CalendarService } from './calendar.service';
import { EmployeesListComponent } from '../employees-list/employees-list.component';
import { planService } from '../../../services/plan.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { ToastComponent } from '../../toast notification/toast.component';

import { Employee } from '../../../interfaces/employeesList.interface';
import {
  CalendarDay,
  WorkingDate,
} from '../../../interfaces/calendarTable.interface';
@Component({
  selector: 'app-calendar-table',
  standalone: true, // Make this a standalone component
  imports: [CommonModule, EmployeesListComponent, ToastComponent], // Import necessary Angular directives
  templateUrl: './calendar-table.component.html',
  styleUrls: ['./calendar-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // Improves performance by checking only changed values
})
export class CalendarTableComponent implements OnInit {
  employees: Employee[] = [];
  workingDates: WorkingDate[] = [];
  proposalDates: WorkingDate[] = [];
  planChanges: { CollabId: number; date: string; action: string }[] = []; // Track plan changes
  respoId: number = -1;
  teamIds: number[] = [];
  showProposal: boolean = false;
  role: string = '';
  constructor(
    private calendarService: CalendarService,
    private planService: planService,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.generateMonth(); // Generate the initial month
    this.generateWeek(); // Generate the initial week
  }

  ngOnInit(): void {
    const tokenData = this.authService.getTokenData();
    this.role = tokenData.role;

    if (['respo', 'leader'].includes(this.role)) {
      this.respoId = tokenData.id;
    }
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

  savePlans() {
    this.planService.savePlan(this.respoId, this.planChanges).subscribe(
      () => {
        this.toastService.showToast('Plans saved', true);
        this.planChanges = [];
        this.cdRef.detectChanges();
      },
      (error) => {
        // Handle error here
        this.toastService.showToast('Error saving plans', false);
        console.error(error);
      }
    );
  }

  showProposalFunc() {
    this.showProposal = !this.showProposal;
  }

  //  ----------------------- emptySavePlans functions ---------------------------
  emptyPlans() {
    if (this.planChanges.length > 0) {
      // Determine the target dates based on the user's role
      const targetDates =
        this.role === 'leader' ? this.proposalDates : this.workingDates;

      this.planChanges.forEach((planChange) => {
        // Process each plan change based on the action
        if (planChange.action === 'add') {
          // Remove the date for 'add' action
          this.removeWorkingDate(
            planChange.CollabId,
            planChange.date,
            targetDates
          );
        } else if (planChange.action === 'delete') {
          // Add back the date for 'delete' action
          this.addBackWorkingDate(planChange, targetDates);
        }
      });

      // Clear planChanges after processing
      this.planChanges = [];
    }
  }

  // Helper function to remove a date for 'add' action
  removeWorkingDate(
    employeeId: number,
    dateStr: string,
    targetDates: Array<{ CollabId: number; date: string }> // Dates to modify based on role
  ): void {
    // Find the index of the date to remove
    const index = targetDates.findIndex(
      (date) => date.CollabId === employeeId && date.date === dateStr
    );

    // If the date is found, remove it from the target dates
    if (index !== -1) {
      targetDates.splice(index, 1); // Remove from targetDates
    }
  }

  // Helper function to add back a date for 'delete' action
  addBackWorkingDate(
    planChange: { CollabId: number; date: string },
    targetDates: Array<{ CollabId: number; date: string }> // Dates to modify based on role
  ): void {
    targetDates.push({
      CollabId: planChange.CollabId,
      date: planChange.date,
    });
  }

  // ---------------------------------------------------------

  getRespoId(id: number) {
    this.respoId = id;
    // Debug log
  }
  getWorkingDays(workingDays: any) {
    if (this.role === 'leader') {
      // Filter workingDays into workingDates and proposalDays
      workingDays.forEach(
        (day: { CollabId: number; date: string; isProposal: string }) => {
          if (day.isProposal) {
            this.proposalDates.push(day);
          } else {
            this.workingDates.push(day);
          }
        }
      );
    } else {
      this.workingDates = [...workingDays];
    }

    // Trigger change detection
    this.cdRef.detectChanges();
  }

  getproposalDay(proposalDays: any) {
    this.proposalDates = [...proposalDays];

    this.cdRef.detectChanges();
  }

  // Check if the day is chosen for the given employee and date
  isChoosingDay(employeeId: number, date: moment.Moment): boolean {
    const formattedDate = this.formatDateToYYYYMMDD(date.toDate());

    const hasExistingWorkDay = this.workingDates.some(
      (workingDate) =>
        workingDate.CollabId === employeeId &&
        workingDate.date === formattedDate
    );

    if (this.role !== 'leader') {
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
    } else {
      return hasExistingWorkDay;
    }
  }

  isProposelDay(employeeId: number, date: moment.Moment): boolean {
    if (this.showProposal) {
      const formattedDate = this.formatDateToYYYYMMDD(date.toDate());

      const hasExistingProposal = this.proposalDates.some(
        (proposalDate) =>
          proposalDate.CollabId === employeeId &&
          proposalDate.date === formattedDate
      );

      if (this.role === 'leader') {
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
          : hasExistingProposal;
      } else {
        return hasExistingProposal;
      }
    }

    return false;
  }

  //  ---------------------------- toggle shift --------------------------------------------
  toggleShift(employeeId: number, date: moment.Moment): void {
    const dateStr = this.formatDateToYYYYMMDD(date.toDate());

    if (this.isPastDate(date)) {
      return;
    }

    const isLeader = this.role === 'leader';

    if (isLeader && !this.showProposal) {
      return;
    }
    if (isLeader) {
      this.toggleShiftForLeader(employeeId, dateStr);
    } else {
      this.toggleShiftForNonLeader(employeeId, dateStr);
    }
  }

  selectProposalOnes() {
    // Current Date
    const currentDate = moment();

    // Filter out working dates that don't exist in proposal dates
    const deleteChanges = this.workingDates
      .filter((workingDate) => {
        const day = moment(workingDate.date, 'YYYY-MM-DD');
        // Check if the day is after the current date and not in proposalDates
        return (
          day.isAfter(currentDate, 'day') &&
          !this.proposalDates.some(
            (proposalDate) =>
              proposalDate.date === workingDate.date &&
              proposalDate.CollabId === workingDate.CollabId
          )
        );
      })
      .map((workingDate) => ({
        date: workingDate.date,
        CollabId: workingDate.CollabId,
        action: 'delete',
      }));

    // Remove the identified dates from `workingDates`
    this.workingDates = this.workingDates.filter(
      (workingDate) =>
        !deleteChanges.some(
          (deleteChange) =>
            deleteChange.date === workingDate.date &&
            deleteChange.CollabId === workingDate.CollabId
        )
    );

    // Add proposal dates that don't exist in working dates
    const addChanges = this.proposalDates
      .filter((proposalDate) => {
        const day = moment(proposalDate.date, 'YYYY-MM-DD');
        // Check if the day is after the current date and not in workingDates
        return (
          day.isAfter(currentDate, 'day') &&
          !this.workingDates.some(
            (workingDate) =>
              workingDate.date === proposalDate.date &&
              proposalDate.CollabId === workingDate.CollabId
          )
        );
      })
      .map((proposalDate) => {
        // Add to workingDates
        this.workingDates.push(proposalDate);
        return {
          date: proposalDate.date,
          CollabId: proposalDate.CollabId,
          action: 'add',
        };
      });

    // Combine add and delete actions into planChanges
    this.planChanges = [...deleteChanges, ...addChanges];

    console.log('Plan Changes:', this.planChanges);
    console.log('Updated Working Dates:', this.workingDates);
  }

  // Helper function to check if the date is in the past
  isPastDate(date: moment.Moment): boolean {
    return (
      date.isBefore(moment().startOf('day')) ||
      date.isSame(moment().startOf('day'))
    );
  }

  // Helper function to toggle shifts for leaders
  toggleShiftForLeader(employeeId: number, dateStr: string): void {
    const existingProposalIndex = this.findShiftIndex(
      this.proposalDates,
      employeeId,
      dateStr
    );
    const existingChangeIndex = this.findPlanChangeIndex(employeeId, dateStr);

    if (existingProposalIndex !== -1) {
      this.proposalDates.splice(existingProposalIndex, 1);
      this.updatePlanChanges(
        existingChangeIndex,
        employeeId,
        dateStr,
        'delete',
        'add'
      );
    } else {
      this.proposalDates.push({ CollabId: employeeId, date: dateStr });
      this.updatePlanChanges(
        existingChangeIndex,
        employeeId,
        dateStr,
        'add',
        'delete'
      );
    }
  }

  // Helper function to toggle shifts for non-leaders
  toggleShiftForNonLeader(employeeId: number, dateStr: string): void {
    const existingWorkingIndex = this.findShiftIndex(
      this.workingDates,
      employeeId,
      dateStr
    );
    const existingChangeIndex = this.findPlanChangeIndex(employeeId, dateStr);

    if (existingWorkingIndex !== -1) {
      this.workingDates.splice(existingWorkingIndex, 1);
      this.updatePlanChanges(
        existingChangeIndex,
        employeeId,
        dateStr,
        'delete',
        'add'
      );
    } else {
      this.workingDates.push({ CollabId: employeeId, date: dateStr });
      this.updatePlanChanges(
        existingChangeIndex,
        employeeId,
        dateStr,
        'add',
        'delete'
      );
    }
  }

  // Helper function to find a shift index in a date array (proposalDates or workingDates)
  findShiftIndex(
    datesArray: { CollabId: number; date: string }[],
    employeeId: number,
    dateStr: string
  ): number {
    return datesArray.findIndex(
      (change) => change.CollabId === employeeId && change.date === dateStr
    );
  }

  // Helper function to find a plan change index
  findPlanChangeIndex(employeeId: number, dateStr: string): number {
    return this.planChanges.findIndex(
      (change) => change.CollabId === employeeId && change.date === dateStr
    );
  }

  // Helper function to update the planChanges array based on action
  updatePlanChanges(
    existingIndex: number,
    employeeId: number,
    dateStr: string,
    addAction: string,
    removeAction: string
  ): void {
    if (
      existingIndex !== -1 &&
      this.planChanges[existingIndex].action === removeAction
    ) {
      this.planChanges.splice(existingIndex, 1);
    } else if (existingIndex === -1) {
      this.planChanges.push({
        CollabId: employeeId,
        date: dateStr,
        action: addAction,
      });
    } else if (this.planChanges[existingIndex].action !== addAction) {
      this.planChanges[existingIndex].action = addAction;
    }
  }

  // ------------------------- the date navigations part ------------------------
  currentDate = moment(); // Current date for the calendar
  daysInMonth: CalendarDay[] = []; // Array of days in the current month
  daysInWeek: CalendarDay[] = []; // Array of days in the current week
  monthYearLabel = ''; // Label for the current month
  weekLabel = ''; // Label for the current week
  currentWeekIndex = 0; // Index to track the current week
  // Create a getter to expose moment to the template
  get moment() {
    return moment;
  }
  // Use @HostListener to detect window resize and adjust mobile mode
  @HostListener('window:resize')
  onResize() {
    this.generateMonth(); // Regenerate month when screen size changes
  }
  formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero if needed
    const day = date.getDate().toString().padStart(2, '0'); // Add leading zero if needed
    return `${year}-${month}-${day}`;
  }
  isToday(date: moment.Moment): boolean {
    return date.isSame(moment(), 'day');
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
    this.currentWeekIndex--; // Prevent going below index 0
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

  // Reset to the current date
  resetToCurrentDate(): void {
    this.currentDate = moment(); // Reset current date to today's date
    this.currentWeekIndex = 0; // Reset the current week index
    this.generateMonth(); // Regenerate the month view
    this.generateWeek(); // Regenerate the week view
  }
}
