
// Interface for the calendar day structure
export interface CalendarDay {
    date: moment.Moment;
    isWeekend: boolean;
  }
  

  // Interface for Form Working Dates
export interface WorkingDate {
    CollabId: number; // Use CollabId instead of formId
    date: string; // Change date to string
    action?: string;
  }