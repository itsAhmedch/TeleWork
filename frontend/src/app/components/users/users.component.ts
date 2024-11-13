import { Component } from '@angular/core';
import { TableComponent } from './table/table.component';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search/search.component';
import { AddUsersComponent } from './add-users/add-users.component';
import { UserService } from '../../services/user.service';
import { ModalComponent } from './add-users/modal/modal.component';
import { MdbModalService } from 'mdb-angular-ui-kit/modal';
import { ToastComponent } from '../toast notification/toast.component';
import { ToastService } from '../../services/toast.service';
import { ConfirmComponent } from '../Confirm Modal/confirm.component';
@Component({
  selector: 'app-users-components',
  standalone: true,
  imports: [
    TableComponent,
    CommonModule,
    SearchComponent,
    AddUsersComponent,
    ToastComponent,
    ConfirmComponent,

  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent {
  constructor(
    private readonly userService: UserService,
    private modalService: MdbModalService,
    private toastService: ToastService
  ) {}
  totalPage = 0;
  currentPage = 1;
  GSearch = '';
  tableHeaders: string[] = [
    '#',
    'Name',
    'LastName',
    'email',
    'Role',
    'team',
    'subteam',
    'Action',
  ];
  tableData: any = [];
  showDeleteModal:boolean=false
  userId:number=-1

  ngOnInit() {
    this.searchUsers('');
  }

  searchUsers(search: any) {
    this.totalPage = 1;
    if (search.isTrusted) {
      search = '';
    }
    if (search != this.GSearch) {
      this.currentPage = 1;
      this.GSearch = search;
    }

    this.getusers(search).then((response) => {
      if (response && response.users) {
        this.tableData = response.users.map((user: any, index: number) => ({
          id: user.id,
          cin: user.cin,
          name: `${user.name}`,
          lastName: `${user.lastName}`,
          email: user.email,
          role: user.role,
          team: user.parentTeam ? user.parentTeam : user.team,
          teamId: user.parentTeam ? user.parentTeam.id : null,
          subteam: user.team ? user.team : null,
          subteamId: user.team ? user.team.id : null,
        }));

        this.totalPage = response.pages;
      }
      this.currentPage = 1;
    });
  }

  async getusers(search: string, iteam = 10): Promise<any> {
    try {
      // Get the response from the API call

      const response = await this.userService.getFilteredUsers(
        search,
        this.currentPage,
        iteam
      );
      const users = response.users;

      const pages = response.pages;

      return { users, pages };
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  // Open the modal for editing a user
  openEditModal(userData: any) {
    const modalRef = this.modalService.open(ModalComponent, {
      data: { editMode: true, userData: userData },
    });
    modalRef.onClose.subscribe((result) => {
      if (result == 'edit') {
        this.toastService.showToast(
          `user with cin: ${userData.cin}  modified successfully`,
          true
        );
        this.searchUsers(this.GSearch);
      }
    });
  }

  // Handle user deletion
 
 
  openDeleteModal(userId: number): void {
    this.showDeleteModal = true;
    this.userId = userId;
  }

  deleteUser(): void {
    if (this.userId !== undefined) {
      this.userService.removeUser(this.userId).subscribe(
        (response) => {
          this.toastService.showToast('Deleted successfully', true);
          this.tableData = this.tableData.filter((user: any) => user.id !== this.userId);
          this.showDeleteModal = false;
        },
        (error) => {
          this.toastService.showToast(error.error.message?error.error.message:'Error deleting user', false);
          console.error('Error deleting user:', error.error.message);
        }
      );
    }
  }
  
  
  
  
  


  onUserModified() {
    this.searchUsers(''); // Refresh the table data
  }
  onPageModified(page: number) {
    this.currentPage = page; // Update the current page
    this.searchUsers(this.GSearch); // Fetch users for the new page
  }

}
