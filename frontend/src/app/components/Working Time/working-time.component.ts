import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { dailyWorkService } from '../../services/DailyWork.service';
import { RecaptchaComponent, RecaptchaModule } from 'ng-recaptcha';
import { environment } from '../../../environments/environment.development';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../toast notification/toast.component';

@Component({
  selector: 'app-working-time',
  standalone: true,
  imports: [RecaptchaModule, CommonModule,ToastComponent],
  templateUrl: './working-time.component.html',
  styleUrls: ['./working-time.component.scss'],
})
export class WorkingTimeComponent implements OnInit {
  @ViewChild(RecaptchaComponent) recaptchaComponent!: RecaptchaComponent;

  siteKey: string = environment.RECAPTCHA_SITE_KEY;
  captchaResolved = false;
  captchaResponse: string | null = null;
  ServerTime = '';
  serverDay = '';
  isworkingDay = false;
  workStatus = true;
 lastClickDuration=''
 timeInterval=0
 lastClickTime=''
  constructor(
    private dailyWorkService: dailyWorkService,
    private cdr: ChangeDetectorRef,
    private toastService : ToastService
  ) {}

  ngOnInit(): void {
    this.getWorkStatus();
  }
  ngOnDestroy(): void {
    // Clear the intervals when the component is destroyed
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }}

  async onSubmit(): Promise<void> {
    if (this.captchaResolved && this.captchaResponse) {
      try {
        // Send work status to the backend
        await this.sendWorkStatus();
        this.lastClickTime=this.ServerTime
        // Reset the CAPTCHA widget
        if (this.recaptchaComponent) {
          this.recaptchaComponent.reset();
        }
        this.toastService.showToast('has been sent', true);
       
      } catch (error) {
        console.error('Error sending time:', error);
        
        this.toastService.showToast('Failed to send it. Please try again.', false);
      }
    } else {
      this.toastService.showToast('Please complete the CAPTCHA', false);
   
    }
  }

  onCaptchaResolved(captchaResponse: string | null): void {
    if (captchaResponse) {
      this.captchaResolved = true;
      this.captchaResponse = captchaResponse;
    }
  }

  
  
    
  
  async sendWorkStatus(): Promise<void> {
    try {
      const response = await this.dailyWorkService.sendWorkStatus().toPromise();
      console.log('API Response:', response); // Log API response
      this.workStatus = !this.workStatus; // Toggle workStatus locally (or update based on API response)
      this.cdr.detectChanges(); // Ensure UI updates
    } catch (error) {
      console.error('Error sending work status:', error);
      throw error; // Re-throw to trigger alert in onSubmit
    }
  }

  getWorkStatus(): void {
    this.dailyWorkService.getStatus().subscribe(
      (result) => {
        this.ServerTime = result.time;
        this.serverDay = result.currentDate;
        this.workStatus = !result.status;
        this.isworkingDay = result.isworkingDay;
        this.lastClickTime = result.lastClickTime;
   
        // Update the local time every second
        this.timeInterval = window.setInterval(() => {
          this.updateLocalTime();
          this.updateLastClickDuration();
        }, 1000);
      },
      (error) => {
        console.error('Error fetching work status:', error);
      }
    );
  }








  updateLocalTime(): void {
    // Parse the ServerTime string (assumes format "HH:MM")
    const [hours, minutes] = this.ServerTime.split(':').map(Number);
    
    // Create a new Date object and set the time to ServerTime
    const currentTime = new Date();
    
    console.log("dd");
    
    // Add one minute to the current time
    if (currentTime.getSeconds()==0) {
      currentTime.setHours(hours, minutes, 0, 0);
      currentTime.setMinutes(currentTime.getMinutes() + 1);
      this.ServerTime = currentTime.toTimeString().slice(0, 5);
    }
  
  
  }
  
 
    updateLastClickDuration() {
      // Parse the ServerTime and lastClickTime strings into Date objects
      const [serverHours, serverMinutes] = this.ServerTime.split(':').map(Number);
      const [clickHours, clickMinutes] = this.lastClickTime.split(':').map(Number);
    
      const serverDate = new Date();
      serverDate.setHours(serverHours, serverMinutes, 0, 0);
    
      const clickDate = new Date();
      clickDate.setHours(clickHours, clickMinutes, 0, 0);
    
      // Calculate the difference in milliseconds
      let diffMs = serverDate.getTime() - clickDate.getTime();
    
      // Handle negative differences (if lastClickTime is in the future, wrap around 24 hours)
      if (diffMs < 0) {
        diffMs += 24 * 60 * 60 * 1000; // Add 24 hours in milliseconds
      }
    
      // Convert the difference to hours and minutes
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const remainingMinutes = diffMinutes % 60;
    
      // Format the result as "HH:MM"
      this.lastClickDuration =`${String(diffHours).padStart(2, '0')}h:${String(remainingMinutes).padStart(2, '0')}m`;
    }
}
