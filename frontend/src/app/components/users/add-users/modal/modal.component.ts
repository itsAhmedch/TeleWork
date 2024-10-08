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

@Component({
  standalone: true,
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
})
export class ModalComponent implements OnInit {
  title: string = 'Create User';
  editMode: boolean = false;
  ErrorMsg = '';
  userData: any = {};
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
    private AuthService: AuthService
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
      idparentTeam: new FormControl('', Validators.required),
      idTeam: new FormControl(
        { value: '', disabled: true },
        Validators.required
      ),
      role: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    const tokenData = this.AuthService.getTokenData();
    this.myId = tokenData.id;
    this.role = tokenData.role;
    this.loadTeamsByRespo(this.myId);

    if (this.editMode && this.userData) {
      this.title = 'Edit User';
      console.log(this.userData);

      this.userForm.patchValue(this.userData);
      this.checkEditValidators();
    }
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
        console.log(this.userData);
        await this.userService
          .editUser(modifiedFields, this.userData.id)
          .subscribe(
            (user) => {
              console.log({ user });
              this.modalRef.close();
            },
            (error) => {
              this.ErrorMsg = error;
              // console.log(error.error,"fgfdgfd");
            }
          );
      } else {
        await this.userService.addUser(formData).subscribe(
          (user) => {
            console.log({ user });
            // Handle successful response here if needed
            this.modalRef.close();
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

  loadTeamsByRespo(idRespo: number): void {
    const teams: any = localStorage.getItem('teams');
    const parsedTeams = JSON.parse(teams);
    if (parsedTeams) {
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
    await this.TeamsService.addTeam(
      isSubTeam ? this.newSubTeam : this.newTeamName, // Team or Subteam name
      this.myId, // The responsible person's ID
      isSubTeam ? Number(this.selectedTeamId) : null // Parent team ID (if subteam)
    ).subscribe({
      next: (team) => {
        this.teams.push(team);
        // Handle success, reset form or refresh data as needed
      },
      error: (err) => {
        console.error('Error adding team:', err);
        // Handle error
      },
    });

    if (!isSubTeam) {
      localStorage.removeItem('teams');
      this.loadTeamsByRespo(this.myId);
    } else {
      if (this.selectedTeamId) {
        await this.loadSubTeamsByRespo(this.myId, this.selectedTeamId);
      }
    }
  }
  deleteTeam(isSubteam: boolean) {
    let id: number=-1;
    if (isSubteam && this.selectedSubTeamId) {
      id = this.selectedSubTeamId;
    } else {
      if (this.selectedTeamId) {
        id = this.selectedTeamId;
      }
    }
    this.TeamsService.deleteTeam(id).subscribe({
      next: (res) => {
        this.teams = this.teams.filter((team: any) => team.id !== id);
        // Handle success, reset form or refresh data as needed
      },
      error: (err) => {
        console.error('Error adding team:', err);
        // Handle error
      },
    })
  }
}
