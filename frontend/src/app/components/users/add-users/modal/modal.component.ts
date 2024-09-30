import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { UserService } from '../../../../services/user.service';
import { AuthService } from '../../../../services/auth.service';
@Component({
  standalone: true,
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  imports: [ReactiveFormsModule, CommonModule],
})
export class ModalComponent implements OnInit {
  title: string = 'Create User';
  message: string = 'Please fill in the details.';
  editMode: boolean = false;
  userData: any;
  teams: any;
  subTeams: any;

  userForm: FormGroup = new FormGroup({
    email: new FormControl('', [
      Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
    ]),
    pwd: new FormControl('', [
      Validators.pattern('^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-zA-Z0-9]).{8,}$'),
    ]),
    cin: new FormControl('', [
      Validators.pattern('^[0-9]{8}$'), // Exactly 8 numeric characters
    ]),
    name: new FormControl(''),
    lastName: new FormControl(''),
    idTeam: new FormControl(''),
    role: new FormControl(''),
  });

  constructor(
    public modalRef: MdbModalRef<ModalComponent>,
    private fb: FormBuilder,
    @Inject(DOCUMENT) private document: Document,
    private userService: UserService,
    private AuthService: AuthService
  ) {}

  ngOnInit(): void {
    const tokenData = this.AuthService.getTokenData();
    this.loadTeamsByRespo(tokenData.id);
    this.userForm.controls['idTeam'].patchValue(this.teams);
    if (this.editMode && this.userData) {
      this.title = 'Edit User';
      this.userForm.patchValue(this.userData); // Fill the form with user data if in edit mode

      // Remove required validators for fields not being edited
      Object.keys(this.userForm.controls).forEach((key) => {
        if (!this.userData[key]) {
          this.userForm.controls[key].clearValidators(); // Remove validators if data not available
          this.userForm.controls[key].updateValueAndValidity();
        }
      });
    } else {
      // Add required validators in create mode
      this.addRequiredValidators();
    }
  }

  addRequiredValidators() {
    this.userForm.controls['email'].setValidators([
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
    ]);
    this.userForm.controls['pwd'].setValidators([
      Validators.required,
      Validators.pattern('^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-zA-Z0-9]).{8,}$'),
    ]);
    this.userForm.controls['cin'].setValidators([
      Validators.required,
      Validators.pattern('^[0-9]{8}$'),
    ]);
    this.userForm.controls['name'].setValidators([Validators.required]);
    this.userForm.controls['lastName'].setValidators([Validators.required]);
    this.userForm.controls['idTeam'].setValidators([Validators.required]);
    this.userForm.controls['role'].setValidators([Validators.required]);

    Object.keys(this.userForm.controls).forEach((key) => {
      this.userForm.controls[key].updateValueAndValidity();
    });
  }

  saveUser() {
    if (this.userForm.valid) {
      const formData = this.userForm.value;

      if (this.editMode) {
        const modifiedFields: any = {};

        Object.keys(formData).forEach((key) => {
          const control = this.userForm.get(key);
          if (formData[key] !== this.userData[key] && control?.valid) {
            modifiedFields[key] = formData[key];
          }
        });

        if (Object.keys(modifiedFields).length > 0) {
          console.log('Closing modal with modified fields:', modifiedFields);

          this.modalRef.close({ type: 'edit', data: modifiedFields });
        } else {
          console.warn('No modified fields to save.');
        }
      } else {
        this.modalRef.close({ type: 'create', data: formData });
      }
    } else {
      console.warn('Form is not valid.');
    }
  }

  closeModal() {
    this.modalRef.close();
  }

  loadTeamsByRespo(idRespo: number): void {
    this.userService.getTeamsByRespo(idRespo).subscribe(
      (data) => {
        this.teams = data;
        console.log(this.teams);
      },
      (error) => {
        console.error('Error loading teams', error);
      }
    );
  }

  loadSubTeamsByRespo(idRespo: number, idTeam: number): void {
    this.userService.getSubTeamsByRespo(idRespo, idTeam).subscribe(
      (data) => {
        this.subTeams = data;
        console.log(this.subTeams);
      },
      (error) => {
        console.error('Error loading sub-teams', error);
      }
    );
  }
}
