import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { planService } from '../../services/plan.service';
import { dailyWorkService } from '../../services/DailyWork.service';
import { RecaptchaModule } from 'ng-recaptcha';
import { environment } from '../../../environments/environment.development';
import { duration } from 'moment';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RecaptchaModule],
  templateUrl: './collab-calendar.component.html',
  styleUrls: ['./collab-calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  currentDate: Date = new Date(); // Current system date
  currentMonth: number = this.currentDate.getMonth(); // Current month (0-11)
  currentYear: number = this.currentDate.getFullYear(); // Current year
  previousMonth: number = (this.currentMonth - 1 + 12) % 12; // Previous month
  previousYear: number =
    this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear; // Previous year if current month is January

  daysInCurrentMonth: (number | null)[] = []; // Days in current month
  daysInPreviousMonth: (number | null)[] = []; // Days in previous month
  weekDays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  myDays: { date: string }[] = []; // The dates you want to highlight
  myProposalDays:{ date: string }[] = [];
  DayInfo: { time: string; workStatus: boolean }[] = [];
  selectedDayInfo = '';
  showInfo = false;
  workingDaysStart: string = '';
  workingDaysEnd: string = '';
  isMobile: boolean = false;
  MyStatus: boolean = false;
  showCaptcha: boolean = false;
  captchaPassed: boolean = false;
  durationOfStatus: string = '';
  
  // reCAPTCHA site key from Google
  siteKey: string = environment.RECAPTCHA_SITE_KEY;

  constructor(
    private planService: planService,
    private dailyWorkService: dailyWorkService
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkIfMobile();
  }

  checkIfMobile() {
    this.isMobile = window.innerWidth < 768; // Adjust width as needed
  }

  ngOnInit(): void {
    this.checkIfMobile();
    this.generateCalendar(this.currentMonth, this.currentYear);
    this.generatePreviousCalendar(this.previousMonth, this.previousYear);
    this.getMyWorkingDays();
    this.getMyProposalDays()
    this.GetStatusInfo();
  }

  GetStatusInfo() {
    this.dailyWorkService.getStatus().subscribe((MyInfo) => {
      

      if (MyInfo.time != null) {
        this.currentDate = new Date(MyInfo.currentDate);
        this.MyStatus = MyInfo.status;
        

     
      }
    });
  }
 

  // -------------------------------------------------------------------

  sendWorkStatus() {
    if (this.captchaPassed) {
      
      this.dailyWorkService.sendWorkStatus().subscribe((res) => {
        this.MyStatus = !this.MyStatus;
    
        this.GetStatusInfo();
      });
    } else {
      this.showCaptcha = true; // Show CAPTCHA if it hasn't been passed
    }
  }

  onCaptchaResolved(captchaResponse: any) {
    if (captchaResponse) {
      this.captchaPassed = true;
      this.showCaptcha = false; // Hide CAPTCHA after success
      this.sendWorkStatus(); // Run the function after CAPTCHA is verified
      this.captchaPassed = false;
    }
  }
  closeCaptcha() {
    this.showCaptcha = false; // Close the modal
  }

  // Call this method to show the captcha
  showCaptchaModal() {
    this.showCaptcha = true;
  }

  GetDAyInfo(day: number, month: number, year: number) {
    if (this.isWorkingDay(day, month, year)) {
      const date = `${year}-${month + 1}-${day}`;
      if (date === this.selectedDayInfo) {
        this.showInfo = !this.showInfo;
      } else {
        this.selectedDayInfo = date;
        this.showInfo = true;
        this.dailyWorkService.GetDAyInfo(date).subscribe((res) => {
          const dayInfo = {
            DailyWork:res.DailyWork,
            duration:res.duration
          }
          
          if (dayInfo.DailyWork.length > 0) {
            this.DayInfo =dayInfo.DailyWork;
          } else {
            this.DayInfo = [];
          }
          this.durationOfStatus=dayInfo.duration
        });
      }
    } else {
      this.DayInfo = [];
    }
  }
  // ----------------------------------------------------------------------------------------------
  // Method to generate current month calendar
  generateCalendar(month: number, year: number): void {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    this.daysInCurrentMonth = Array.from(
      { length: totalDays },
      (_, i) => i + 1
    );

    // Add inactive days (nulls) to the beginning of the array
    for (let i = 0; i < firstDayOfMonth; i++) {
      this.daysInCurrentMonth.unshift(null);
    }
  }

  // Method to generate previous month calendar
  generatePreviousCalendar(month: number, year: number): void {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    this.daysInPreviousMonth = Array.from(
      { length: totalDays },
      (_, i) => i + 1
    );

    // Add inactive days (nulls) to the beginning of the array
    for (let i = 0; i < firstDayOfMonth; i++) {
      this.daysInPreviousMonth.unshift(null);
    }
  }

  changeMonth(direction: number): void {
    this.currentMonth += direction;
    this.previousMonth += direction;

    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }

    if (this.previousMonth < 0) {
      this.previousMonth = 11;
      this.previousYear--;
    } else if (this.previousMonth > 11) {
      this.previousMonth = 0;
      this.previousYear++;
    }

    this.generateCalendar(this.currentMonth, this.currentYear);
    this.generatePreviousCalendar(this.previousMonth, this.previousYear);
  }

  goToToday(): void {
    // Set the calendar to today's date
    this.currentDate = new Date();
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
    this.previousMonth = (this.currentMonth - 1 + 12) % 12; // Update previous month
    this.previousYear =
      this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear; // Update previous year
    this.currentDate = new Date(); // Today's date

    this.generateCalendar(this.currentMonth, this.currentYear);
    this.generatePreviousCalendar(this.previousMonth, this.previousYear);
  }

  isToday(day: number, month: number, year: number): boolean {
    return (
      day === this.currentDate.getDate() &&
      month === this.currentDate.getMonth() &&
      year === this.currentDate.getFullYear()
    );
  }

  isTodayWorkday(): boolean {
    const formattedToday = this.currentDate.toISOString().split('T')[0]; // Get 'YYYY-MM-DD' format

    return this.myDays.some((day) => day.date === formattedToday);
  }

  // Function to highlight working days
  isWorkingDay(day: number, month: number, year: number): boolean {
    const formattedDate = this.formatDate(year, month, day);

    return this.myDays.some((workDay) => workDay.date === formattedDate);
  }
 
  isOldWorkingDay(day: number, month: number, year: number): boolean {
    if (this.isWorkingDay(day, month, year)) {
      // Ensure the current date is a Date object
      const todayDate = new Date(this.currentDate);
      // Set today's date to midnight (00:00:00)
      todayDate.setHours(0, 0, 0, 0);

      const otherDate = new Date(year, month, day);
      // Set the other date to midnight (00:00:00)
      otherDate.setHours(0, 0, 0, 0);

      

      // Compare the dates
      return otherDate < todayDate;
    }

    return false;
  }

   // Function to highlight Proposal days
   isProposalDay(day: number, month: number, year: number): boolean {
    const formattedDate = this.formatDate(year, month, day);

    return this.myProposalDays.some((workDay) => workDay.date === formattedDate);
  }
  formatDate(year: number, month: number, day: number): string {
    // Format date as 'YYYY-MM-DD'
    const monthStr = (month + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  }

  // Format a Date object as 'YYYY-MMM-DD'
  formatDateFromDateObject(date: Date): string {
    const year = date.getFullYear();
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = monthNames[date.getMonth()]; // Get the abbreviated month name
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}${day}`;
  }
  // ---------------------------------------------------------------------
  getMyWorkingDays() {
    this.planService.getMyWorkingDays().subscribe((days: any) => {
      this.myDays = days;

      this.getWorkingDaysRange(); // Call after fetching working days
    });
  }
  getMyProposalDays() {
    this.planService.getMyProposalDays().subscribe((days: any) => {
      this.myProposalDays = days;

     
    });
  }

  getWorkingDaysRange() {
    if (this.myDays.length > 0) {
      // Convert the date strings to Date objects
      const sortedDays = this.myDays
        .map((day) => new Date(day.date))
        .sort((a, b) => a.getTime() - b.getTime()); // Sort by time

      // Get the smallest and largest dates
      const smallestDate = sortedDays[0];
      const largestDate = sortedDays[sortedDays.length - 1];

      // Format the dates as strings
      this.workingDaysStart = this.formatDateFromDateObject(smallestDate);
      this.workingDaysEnd = this.formatDateFromDateObject(largestDate);
    }
  }
}
