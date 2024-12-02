import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent {
  @Input() tableHeaders: string[] = [];
  @Input() tableData: {
    id: number;
    mat: number;
    name: string;
    lastName: string;
    email: string;
    role: string;
    subteam: string;
    team: string;
  }[] = [];

  @Input() totalPage: number = 0;
  @Input() currentPage: number = 1;

  // Event emitters for edit and delete actions
  @Output() editRow = new EventEmitter<any>();
  @Output() deleteRow = new EventEmitter<number>();
  @Output() Page = new EventEmitter<number>();

  // Emit the selected row's data to the parent component for editing
  onEdit(rowData: any) {
    this.editRow.emit(rowData);
  }

  // Emit the row ID to the parent component for deletion
  onDelete(rowId: number) {
    this.deleteRow.emit(rowId);
  }

  changePage(action: string) {
    
    let newPage = this.currentPage; // Store current page for modification
    
    if (action === 'Prev' && this.currentPage > 1) {
      newPage--; // Decrease the page number
    } else if (action === 'Next' && this.currentPage < this.totalPage) {
      newPage++; // Increase the page number
    }
  
    // Emit the new page number if it is valid
    if (newPage !== this.currentPage) {
      this.currentPage = newPage; // Update the current page
      this.Page.emit(this.currentPage); // Emit the new current page to the parent
    }
  }
  
}
