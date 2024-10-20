import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TeamsService } from '../../services/team.service';
import { throwError } from 'rxjs';
import { extractDataService } from '../../services/ExtractData.service';

@Component({
  selector: 'app-extract-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './extract-data.component.html',
  styleUrls: ['./extract-data.component.scss'], // Corrected 'styleUrls'
})
export class ExtractDataComponent implements OnInit {
  responsibles: { fullname: string; id: number }[] = [];
  teams: { name: string; id: number }[] = [];
  subTeams: { name: string; id: number }[] = [];
  SelectedTeam: number = -1;
  selectedRespoId: number =-1
  Form = new FormGroup({
    responsible: new FormControl(null),
    team: new FormControl(null),
    subTeam: new FormControl(null),
    choice: new FormControl('plan'), // Default to 'plan'
    startDate: new FormControl(null),
    endDate: new FormControl(null),
  });
  role: string = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private teamsService: TeamsService,
    private extractServices:extractDataService
  ) {}

  ngOnInit(): void {
    const tokenData = this.authService.getTokenData();
    this.role = tokenData.role;
    if (this.role === 'admin') {
      this.loadResponsibles();
    } else {
      this.selectedRespoId=Number(tokenData.id)
      this.Form.get('responsible')?.setValue(tokenData.id);
      this.loadTeamsByRespo(this.selectedRespoId);
    }
  }

  onChangeRespo() {
    const selectedRespo = this.Form.get('responsible')?.value ?? '';

    if (selectedRespo !== '' && this.role === 'admin') {
      this.selectedRespoId=Number(selectedRespo)
      this.loadTeamsByRespo(this.selectedRespoId);
      this.Form.get('team')?.setValue(null);
      this.Form.get('subTeam')?.setValue(null);
    }
  }
  onChangeTeam() {
    const selectedRespo = this.Form.get('responsible')?.value ?? '';
    const selectedTeam = this.Form.get('team')?.value ?? '';

    if (selectedRespo !== '' && selectedTeam !== '') {
      if (selectedTeam === 'all') {
        this.SelectedTeam = -1;
        this.Form.get('subTeam')?.disable();
      } else {
        this.Form.get('subTeam')?.enable();
        this.SelectedTeam = Number(selectedTeam);
        this.loadSubteams(Number(selectedRespo), Number(selectedTeam));
        this.Form.get('subTeam')?.setValue(null);
      }
    }
    console.log(this.SelectedTeam);
  }
  onChangeSubTeams() {
    const selectedSubTeam = this.Form.get('subTeam')?.value;
    if (selectedSubTeam) {
      if (selectedSubTeam === 'all') {
        const selectedTeam = this.Form.get('team')?.value ?? '';
        this.SelectedTeam = Number(selectedTeam);
      } else {
        console.log(selectedSubTeam);

        this.SelectedTeam = Number(selectedSubTeam);
      }
    }

    console.log(this.SelectedTeam);
  }

  private async loadResponsibles(): Promise<void> {
    try {
      this.responsibles = await this.userService.getRespoList().toPromise();
    } catch (error) {
      this.teams = [];
      this.subTeams = [];
      this.Form.get('team')?.setValue(null);
      this.Form.get('subTeam')?.setValue(null);
      console.error('Error loading responsibles', error);
    }
  }

  private loadTeamsByRespo(idRespo: number): void {
    if (idRespo !== -1) {
      this.teamsService.getTeamsByRespo(idRespo).subscribe(
        (data) => {
          console.log(data);

          this.teams = data ?? [];
          this.subTeams = [];
        },

        (error) => {
          this.Form.get('subTeam')?.setValue(null);
          this.subTeams = [];
          console.error(error);
        }
      );
    }
  }

  private loadSubteams(idRespo: number, idTeam: number) {
    this.teamsService.getSubTeamsByRespo(idRespo, idTeam).subscribe(
      (data) => {
        this.subTeams = data;
      },
      (error) => console.error(error)
    );
  }

  onSubmit(): void {
    if (this.Form.valid) {
      const formData = this.Form.value;
      console.log('Form Submitted!', formData);

      // Logic for downloading the plan can be added here.
      // For example, you can send this data to your backend API
    } else {
      console.error('Form is invalid');
    }
  }

  downloadPlan() {
    
    const startDate = this.Form.get('startDate')?.value ?? '';
    const endDate = this.Form.get('endDate')?.value ?? '';
    const choice = this.Form.get('choice')?.value ?? '';
    const respoId = this.Form.get('choice')?.value ?? '';
    // Check if all required fields are entered
    if (respoId!='' && startDate && endDate) {
        if (startDate  > endDate) {
            alert("Please the end date should be bigger than the start date")
            return 
        }
       
      
          this.extractServices.downloadTeamPlan(this.selectedRespoId,this.SelectedTeam , startDate, endDate, choice);
        
    } else {
        // Alert an error if any required field is missing
        alert('Please enter all required fields.');
    }
}
}
