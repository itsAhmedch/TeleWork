import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { UserService } from '../../../../services/user.service';
import { TeamsService } from '../../../../services/team.service';
import { AuthService } from '../../../../services/auth.service';
import { ToastService } from '../../../../services/toast.service';
import { ToastComponent } from '../../../toast notification/toast.component';

@Component({
  standalone: true,
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  imports: [ReactiveFormsModule, CommonModule, FormsModule,ToastComponent],
})
export class ModalComponent implements OnInit {
  title: string = 'Create User';
  editMode: boolean = false;
  ErrorMsg = '';
  userData: any = {};
  responsibles: any = [];
  teams: any = [];
  subTeams: any = [];
  newTeamName: string = '';
  newSubTeam: string = '';
  selectedTeamId: number | null = null;
  selectedSubTeamId: number | null = null;
  myId: number = -1;
  role = '';
  userForm: FormGroup;
  showTeamField = false;
  showSubTeamField = false;

  constructor(
    public modalRef: MdbModalRef<ModalComponent>,
    @Inject(DOCUMENT) private document: Document,
    private userService: UserService,
    private TeamsService: TeamsService,
    private AuthService: AuthService,
    private toastService:ToastService
   
  ) {
    this.userForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
      ]),
      pwd: new FormControl('', [
        Validators.required,
        Validators.pattern(
          '^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-zA-Z0-9]).{8,}$'
        ),
      ]),
      cin: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]{8}$'),
      ]),
      name: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      idresponsible: new FormControl('', Validators.required),
      idparentTeam: new FormControl('', Validators.required),
      idTeam: new FormControl(''),
      role: new FormControl('collab', Validators.required),
    });
  }

  async ngOnInit() {
    const tokenData = this.AuthService.getTokenData();
    this.role = tokenData.role;

    if (this.role !== 'admin') {
      this.myId = tokenData.id;
      this.loadTeamsByRespo(this.myId);
      this.userForm.get('idresponsible')?.setValidators([]);
    } else {
      await this.loadResponsibles();
    }

    if (this.editMode && this.userData) {
      this.title = 'Edit User';
      this.userForm.patchValue(this.userData);
      // Disable role change for responsibles

      // Disable role change for responsibles and allow only "collab" or "leader"
      if (this.userData.role === 'respo') {
        this.userForm.get('role')?.disable(); // Disable role change for responsibles
      } else {
        this.userForm.get('role')?.enable(); // Enable role selection for other roles
        this.userForm.get('role')?.setValue(this.userData.role); // Set to current role
        this.toggleEditRoleValidator();
      }

      this.checkEditValidators();
    }

    this.userForm.get('role')?.valueChanges.subscribe((role) => {
      this.toggleTeamFields(role);
    });
  }

  toggleEditRoleValidator() {
    const roleControl = this.userForm.get('role');

    // If in edit mode and role is not "respo", restrict selection to "collab" or "leader"
    if (this.editMode) {
      roleControl?.setValidators([
        Validators.required,
        Validators.pattern('^(collab|leader)$'), // Only allow 'collab' or 'leader'
      ]);
      roleControl?.updateValueAndValidity();
    }
  }

  toggleTeamFields(role: string) {
    const teamControl = this.userForm.get('idparentTeam');
    const subTeamControl = this.userForm.get('idTeam');
    const idresponsible = this.userForm.get('idresponsible');

    if (role == 'respo') {
      idresponsible?.disable(); // Disable the responsible field for responsibles
      teamControl?.disable();
      subTeamControl?.disable();
      teamControl?.setValidators([]); // Clear validators for teams and subteams
      subTeamControl?.setValidators([]);
      console.log(role);
    } else {
      if (!this.editMode) {
        idresponsible?.enable(); // Enable responsible field for other roles
        teamControl?.enable();
        teamControl?.setValidators([Validators.required]); // Require team field for non-responsibles
      }
    }

    // Additional checks for collab or leader roles
    if (role === 'collab' || role === 'leader') {
      idresponsible?.enable(); // Enable responsible field for collabs and leaders
    }

    teamControl?.updateValueAndValidity();
    subTeamControl?.updateValueAndValidity();
  }
  checkEditValidators() {
    Object.keys(this.userForm.controls).forEach((key) => {
      if (!this.userData[key]) {
        this.userForm.get(key)?.clearValidators();
      }
      this.userForm.get(key)?.updateValueAndValidity();
    });
  }

  async saveUser() {
    if (this.userForm.valid) {
      const formData = this.userForm.value;

      if (this.editMode) {
        
        const modifiedFields: any = {};
        Object.keys(formData).forEach((key) => {
          // Include the field only if it has changed AND it is not empty or null
          const originalValue = this.userData[key];
          const currentValue = formData[key];

          if (currentValue !== originalValue && currentValue !== '') {
            modifiedFields[key] = currentValue;
          }
        });

        this.userService.editUser(modifiedFields, this.userData.id).subscribe(
          (user) => {
            this.modalRef.close('edit');
          },
          (error) => {
            this.ErrorMsg = error;
            // console.log(error.error,"fgfdgfd");
          }
        );
      } else {
        formData.idTeam = Number(formData.idTeam);
        formData.idparentTeam = Number(formData.idparentTeam);
        if (!formData.idTeam && this.userForm.get('role')?.value != 'respo') {
          formData.idTeam = formData.idparentTeam;
        }
        console.log(formData);
        this.userService.addUser(formData).subscribe(
          (user) => {
           
            // Handle successful response here if needed
            this.modalRef.close('add');

          },
          (error) => {
            this.ErrorMsg = error;
          }
        );
      }
    } else {
      console.warn('Form is not valid.');
    }
  }

  closeModalFunc() {
    this.modalRef.close(null);
  }

  private async loadResponsibles(): Promise<void> {
    try {
      this.responsibles = await this.userService.getRespoList().toPromise();
    
    } catch (error) {
      throw new Error('loading responsibles failed');
    }
  }

  onRespoChange() {
    const selectedRespo = this.userForm.get('idresponsible')?.value ?? '';
    if (selectedRespo !== '' && this.role === 'admin') {
     
      this.teams = [];
      this.subTeams = [];
      this.userForm.get('idparentTeam')?.setValue(null);
      this.userForm.get('idTeam')?.setValue(null);
      this.loadTeamsByRespo(Number(selectedRespo));
      this.myId = Number(selectedRespo);
    }
  }

  loadTeamsByRespo(idRespo: number): void {
    const teams: any = localStorage.getItem('teams');
    const parsedTeams = JSON.parse(teams);
    if (parsedTeams && this.role !== 'admin') {
      this.teams = parsedTeams;
    } else {
      this.TeamsService.getTeamsByRespo(idRespo).subscribe(
        (data) => {
          this.teams = data;
          localStorage.setItem('teams', JSON.stringify(this.teams));
        },
        (error) => {
          console.error('Error loading teams', error);
        }
      );
    }
  }

  onTeamChange() {
    this.selectedTeamId = this.userForm.get('idparentTeam')?.value;

    if (!this.selectedTeamId) {
      this.userForm.get('idTeam')?.disable();
      this.subTeams = [];
    } else {
      this.userForm.get('idTeam')?.enable();
      this.loadSubTeamsByRespo(this.myId, this.selectedTeamId);
    }
  }
  onSubTeamChange() {
    this.selectedSubTeamId = this.userForm.get('idTeam')?.value;
  }

  async loadSubTeamsByRespo(idRespo: number, idTeam: number): Promise<void> {
    this.subTeams = [];
    await this.TeamsService.getSubTeamsByRespo(idRespo, idTeam).subscribe(
      (data) => {
        this.subTeams = data;
      },
      (error) => {
        console.error('Error loading sub-teams', error);
      }
    );
  }

  changeSubTeamMode() {
    this.showSubTeamField = !this.showSubTeamField;
  }

  changeTeamMode() {
    this.showTeamField = !this.showTeamField;
  }

  async addTeam(isSubTeam: boolean) {
    if (isSubTeam) {
      this.changeSubTeamMode();
    } else {
      this.changeTeamMode();
    }

    // Check if the new team name or subteam name is provided
    if ((!isSubTeam && !this.newTeamName) || (isSubTeam && !this.newSubTeam)) {
      console.error('Team name is required');
      return; // Stop the function if no name is provided
    }

    // Get the selected parent team ID if adding a subteam

    if (isSubTeam && !this.selectedTeamId) {
      console.error('Parent team must be selected for subteam');
      return;
    }

    // Call the addTeam method from the TeamsService
    this.TeamsService.addTeam(
      isSubTeam ? this.newSubTeam : this.newTeamName, // Team or Subteam name
      this.myId, // The responsible person's ID
      isSubTeam ? Number(this.selectedTeamId) : null // Parent team ID (if subteam)
    ).subscribe({
      next: async (team) => {
        this.toastService.showToast(isSubTeam?'SubTeam added successfully':'Team added successfully',true)
        this.teams.push(team);
        isSubTeam ? this.newSubTeam : (this.newTeamName = '');
        // Handle success, reset form or refresh data as needed
        if (!isSubTeam) {
          localStorage.removeItem('teams');
          this.loadTeamsByRespo(this.myId);
        } else {
          if (this.selectedTeamId) {
            await this.loadSubTeamsByRespo(this.myId, this.selectedTeamId);
          }
        }
      },
      error: (err) => {
        this.toastService.showToast(isSubTeam?'SubTeam added successfully':'Team added successfully',true)
        this.toastService.showToast(isSubTeam?'Error adding Subteam':'Error adding Team',false)
        console.error('Error adding team:', err);
        // Handle error
      },
    });
  }

  deleteTeam(isSubteam: boolean) {
    let id: number = -1;
    if (isSubteam && this.selectedSubTeamId) {
      id = this.selectedSubTeamId;
    } else {
      if (this.selectedTeamId) {
        id = this.selectedTeamId;
      } else return;
    }
    this.TeamsService.deleteTeam(id).subscribe({
      next: async (res) => {
        if (!isSubteam) {

          localStorage.removeItem('teams');
          this.loadTeamsByRespo(this.myId);
          this.selectedTeamId = null;
        } else {
          if (this.selectedTeamId) {
            await this.loadSubTeamsByRespo(this.myId, this.selectedTeamId);
          }
          this.selectedSubTeamId = null;
        }
        this.toastService.showToast('deleted successfully',true)
        // Log the current state of subTeams to verify
        console.log('Updated subTeams:', this.subTeams);

        // Clear the error message and handle success
        this.ErrorMsg = '';
      },
      error: (err) => {
        this.toastService.showToast('Error deleting team',false)
        this.ErrorMsg = err;
        console.error('Error deleting team:', err);
        // Handle error
      },
    });
  }


}
