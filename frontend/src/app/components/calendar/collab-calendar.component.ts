import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { planService } from '../../services/plan.service';
import { dailyWorkService } from '../../services/DailyWork.service';
import { RecaptchaModule } from 'ng-recaptcha';
import { environment } from '../../../environments/environment.development';

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
  workingDaysStart: string = '';
  workingDaysEnd: string = '';
  isMobile: boolean = false;
  MyStatus: boolean = false;
  showCaptcha: boolean = false;
  captchaPassed: boolean = false;
  durationOfStatus:string='';
  private intervalId: any; // Store the interval ID for clearing later
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

  ngOnInit(): void {
    this.generateCalendar(this.currentMonth, this.currentYear);
    this.generatePreviousCalendar(this.previousMonth, this.previousYear);
    this.getMyWorkingDays();
    this.checkIfMobile();
    this.GetStatusInfo();
  }

  GetStatusInfo() {
    this.dailyWorkService.getStatus().subscribe((MyInfo) => {
      console.log(MyInfo);

      this.currentDate = new Date(MyInfo.currentDate);
      this.MyStatus = MyInfo.status;
      const lastWorkDate: string = MyInfo.date;
      const lastworkTime: string = MyInfo.time;
      this.durationOfStatus=this.getDuration(lastWorkDate,lastworkTime,this.currentDate)

        // Update duration every minute
        this.intervalId = setInterval(() => {
          // Recalculate current date every time to reflect real-time change
          this.currentDate = new Date();
          this.durationOfStatus = this.getDuration(lastWorkDate, lastworkTime, this.currentDate);
        }, 60000); // Update every 60 seconds (1 minute)
   
    });
  }
  getDuration(lastWorkDate:string,lastworkTime:string,currentDateTime:Date) {
    // Assuming lastWorkDate is a string (e.g., '2024-10-19') and lastworkTime is a string (e.g., '14:30')
    // Combine lastWorkDate and lastworkTime into a valid Date object
    const lastWorkDateTime = new Date(`${lastWorkDate}T${lastworkTime}:00`); // 'T' is for time format in ISO 8601

  
    // Get the difference in milliseconds between current date and last work date-time
    const diffInMs = currentDateTime.getTime() - lastWorkDateTime.getTime();

    // Convert milliseconds to minutes
    const diffInMinutes = Math.floor(diffInMs / 60000);

    // Convert to hours and minutes
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;

    // Format the duration as hh:mm (two digits for hours and minutes)
    const duration = `${hours.toString().padStart(2, '0')}h${minutes
      .toString()
      .padStart(2, '0')}m`;

   
    console.log(duration); // Outputs the duration in hh:mm format
    return duration
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId); // Clear the interval to avoid memory leaks
    }
  }
  checkIfMobile() {
    this.isMobile = window.innerWidth < 768; // Adjust width as needed
  }

  closeCaptcha() {
    this.showCaptcha = false; // Close the modal
  }

  // Call this method to show the captcha
  showCaptchaModal() {
    this.showCaptcha = true;
  }
  sendWorkStatus() {
    if (this.captchaPassed) {
      console.log('Work status has been updated!');
      this.dailyWorkService.sendWorkStatus().subscribe((res) => {
        this.MyStatus = !this.MyStatus;
        this.durationOfStatus='00h00m'
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

  getMyWorkingDays() {
    this.planService.getMyWorkingDays().subscribe((days: any) => {
      this.myDays = days;

      this.getWorkingDaysRange(); // Call after fetching working days
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
