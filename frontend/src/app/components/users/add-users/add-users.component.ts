import { Component, EventEmitter, Output } from '@angular/core';
import { MdbModalRef, MdbModalService, MdbModalModule } from 'mdb-angular-ui-kit/modal';
import { ModalComponent } from './modal/modal.component';
import { UserService } from '../../../services/user.service';
import { ToastComponent } from '../../toast notification/toast.component';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-add-users',
  standalone: true,
  imports: [MdbModalModule,ToastComponent],
  templateUrl: './add-users.component.html',
  styleUrls: ['./add-users.component.scss'],
})
export class AddUsersComponent {
  @Output() userModified = new EventEmitter<void>();
  constructor(private modalService: MdbModalService,private toastService:ToastService) {}

  openModal(editMode: boolean, userData?: any) {
    const modalRef = this.modalService.open(ModalComponent, {
      data: { editMode, userData },
    });

    modalRef.onClose.subscribe((result) => {
      if (result) {
        if (result === 'add') {
          this.toastService.showToast('added successfully',true)
        }
        this.userModified.emit();
      }
      
     
    });
  
  }

  // Method to handle adding a user (opens the modal in create mode)
  addUser() {
    this.openModal(false); // false indicates create mode
  }

  // Method to handle editing a user (opens the modal in edit mode)
  editUser(user: any) {
    this.openModal(true, user); // true indicates edit mode and passes user data
  }

}
