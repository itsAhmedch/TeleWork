import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {
  @Input() tableHeaders: string[] = [];
  @Input() tableData : { id: number; cin :number ,name: string;lastName: string; email: string; role: string; subteam: string; team: string; }[]= [];
  @Input() totalPage :number=0

   // Event emitters for edit and delete actions
   @Output() editRow = new EventEmitter<any>();
   @Output() deleteRow = new EventEmitter<number>();
 
   // Emit the selected row's data to the parent component for editing
   onEdit(rowData: any) {
     this.editRow.emit(rowData);
   }
 
   // Emit the row ID to the parent component for deletion
   onDelete(rowId: number) {
     this.deleteRow.emit(rowId);
   }



}
