import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.scss',
})
export class ConfirmComponent {
  @Input() itemId?: number; // Optional ID of the item to be deleted
  @Input() title: string = 'Confirm Action';
  @Input() content: string = 'Are you sure you want to proceed?';
  @Input() btnText: string = 'confirme';
  @Output() confirm = new EventEmitter<number | void>(); // Emits the ID if available, otherwise just a void event
  @Output() cancel = new EventEmitter<void>(); // Emits when cancelled

  onConfirm(): void {
    if (this.itemId !== undefined) {
      this.confirm.emit(this.itemId); // Emit the item ID to confirm deletion if available
    } else {
      this.confirm.emit(); // Emit without ID
    }
  }

  onCancel(): void {
    this.cancel.emit(); // Emit an event to indicate cancellation
  }
}
