import { Component, EventEmitter, Output } from '@angular/core';
import { MdbModalRef, MdbModalService, MdbModalModule } from 'mdb-angular-ui-kit/modal';
import { ModalComponent } from './modal/modal.component';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-add-users',
  standalone: true,
  imports: [MdbModalModule],
  templateUrl: './add-users.component.html',
  styleUrls: ['./add-users.component.scss'],
})
export class AddUsersComponent {
  @Output() userModified = new EventEmitter<void>();
  constructor(private modalService: MdbModalService,private userService:UserService ) {}

  openModal(editMode: boolean, userData?: any) {
    const modalRef = this.modalService.open(ModalComponent, {
      data: { editMode, userData },
    });

    modalRef.onClose.subscribe((result) => {
      if (result) {
        
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
