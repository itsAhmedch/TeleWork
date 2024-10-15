import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { TeamsService } from '../../../services/team.service';
import { planService } from '../../../services/plan.service';
import { AuthService } from '../../../services/auth.service';

// Interfaces
interface Employee {
  id: number;
  fullname: string;
  cin: number;
}

interface Responsible {
  id: number;
  fullname: string;
}

interface Team {
  id: number;
  name: string;
}

@Component({
  selector: 'app-employees-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employees-list.component.html',
  styleUrls: ['./employees-list.component.scss'],
})
export class EmployeesListComponent implements OnInit {
  employees: Employee[] = [];
  responsibles: Responsible[] = [];
  selectedRespo = -1;
  selectedTeamId = -1;

  employeesForm = new FormGroup({
    responsible: new FormControl(null),
    team: new FormControl(null),
    subTeam: new FormControl(null),
  });

  @Output() employeesEvent = new EventEmitter<Employee[]>();
  @Output() respoEvent = new EventEmitter<number>();
  @Output() workingsDaysEvent = new EventEmitter<any[]>();

  teams: Team[] = [];
  subTeams: Team[] = [];
  role: string = '';

  constructor(
    private userService: UserService,
    private planService: planService,
    private teamsService: TeamsService,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
  }

  private initializeForm(): void {
    this.employeesForm.get('team')?.disable();
    this.employeesForm.get('subTeam')?.disable();
  }

  private async loadInitialData(): Promise<void> {
    const tokenData = this.authService.getTokenData();
    this.role = tokenData.role;

    if (this.role === 'admin') {
      await this.loadResponsibles();
      this.fetchEmployees(true);
    }

    if (this.role === 'respo') {
      this.selectedRespo = tokenData.id;
      this.respoEvent.emit(this.selectedRespo);
      await this.loadTeamsByRespo(this.selectedRespo);
      this.fetchEmployees(false);
      this.employeesForm.get('team')?.enable();
    }

    if (this.role === 'leader') {
      this.getLeaderTeamPlan()
      this.getMyTeam()
    }
  }

  private async loadResponsibles(): Promise<void> {
    try {
      const result = await this.userService.getRespoList().toPromise();
      this.responsibles = Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error loading responsibles:', error);
    }
  }

  onRespoChange(): void {
    const selectedRespo = this.employeesForm.get('responsible')?.value ?? '';

    if (selectedRespo === '' && this.role === 'admin') {
      this.resetTeams();
    } else {
      this.selectedRespo = Number(selectedRespo);
      this.loadTeamsByRespo(this.selectedRespo);
      this.employeesForm.get('team')?.enable();
      this.employeesForm.get('team')?.setValue(null);
      this.employeesForm.get('subTeam')?.setValue(null);
      this.employeesForm.get('subTeam')?.disable();
      this.fetchEmployees(false);
    }
  }

  private resetTeams(): void {
    this.selectedRespo = -1;
    this.selectedTeamId = -1;
    this.teams = [];
    this.subTeams = [];
    this.employeesForm.get('team')?.disable();
    this.employeesForm.get('subTeam')?.disable();
    this.fetchEmployees(true);
  }

  private fetchEmployees(getAll: boolean): void {
    this.userService
      .getCollabsNames(this.selectedRespo, this.selectedTeamId, getAll)
      .subscribe(
        (data) => {
          this.employees = data;
          this.getPlans(getAll);
          this.employeesEvent.emit(this.employees);
        },
        (error) => {
          console.error('Error fetching employees:', error);
        }
      );
  }
 
  private loadTeamsByRespo(idRespo: number): void {
    if (idRespo !== -1) {
      this.teamsService.getTeamsByRespo(idRespo).subscribe(
        (data) => {
          this.teams = data ?? [];
          this.subTeams = [];
          this.cdRef.detectChanges();
        },
        (error) => {
          console.error('Error loading teams', error);
          this.teams = [];
          this.subTeams = [];
        }
      );
    }
  }

  onTeamChange(isSubteam: boolean): void {
    const team = this.employeesForm.get('team')?.value ?? '';
    const subTeam = this.employeesForm.get('subTeam')?.value ?? '';
  
    if (!isSubteam && team !== '') {
      this.selectedTeamId = Number(team);
      this.employeesForm.get('subTeam')?.setValue(null);
      this.employeesForm.get('subTeam')?.disable();
      this.loadSubTeamsByRespo(this.selectedRespo, this.selectedTeamId);
      this.fetchEmployees(false);
    } else if (team === '') {
      this.selectedTeamId = -1;
      this.fetchEmployees(false);
      this.employeesForm.get('subTeam')?.disable();
    } else {
      // Handle the case when a subteam is selected
      if (isSubteam) {
        if (subTeam !== '') {
          // If a subteam is selected, get its ID
          const selectedSubTeamId = Number(subTeam);
          // Fetch employees based on the selected subteam
          this.fetchEmployeesBySubTeam(selectedSubTeamId);
        } else {
          // If subteam is empty, fetch employees for the selected team
          this.fetchEmployeesByTeam(this.selectedTeamId);
        }
      } else {
        // Reset selected team ID if needed
        this.selectedTeamId = -1; // This may not be necessary in this case
      }
    }
  }
  
// Create a new method to fetch employees by team
private fetchEmployeesByTeam(teamId: number): void {
  this.userService
    .getCollabsNames(this.selectedRespo, teamId, false) // Fetch employees for the team
    .subscribe(
      (data) => {
        this.employees = data;
        this.getPlans(false);
        this.employeesEvent.emit(this.employees);
      },
      (error) => {
        console.error('Error fetching employees for team:', error);
      }
    );
}

// Create a new method to fetch employees by subteam
private fetchEmployeesBySubTeam(subTeamId: number): void {
  this.userService
    .getCollabsNames(this.selectedRespo, subTeamId, false) // Fetch employees for the subteam
    .subscribe(
      (data) => {
        this.employees = data;
        this.getPlans(false);
        this.employeesEvent.emit(this.employees);
      },
      (error) => {
        console.error('Error fetching employees for subteam:', error);
      }
    );
}

  private loadSubTeamsByRespo(idRespo: number, idTeam: number): void {
    if (idRespo !== -1 && idTeam !== -1) {
      this.teamsService.getSubTeamsByRespo(idRespo, idTeam).subscribe(
        (data) => {
          this.subTeams = data;
          if (this.subTeams.length > 0) {
            this.employeesForm.get('subTeam')?.enable();
          } else {
            this.employeesForm.get('subTeam')?.disable();
          }
          this.fetchEmployees(false);
          this.cdRef.detectChanges();
        },
        (error) => {
          console.error('Error loading sub-teams', error);
          this.subTeams = [];
          this.employeesForm.get('subTeam')?.disable();
        }
      );
    }
  }

  private getPlans(getAll: boolean): void {
    const teamsIds =
      this.selectedTeamId === -1 ? this.teams.map((t) => t.id) : [this.selectedTeamId];
    this.planService.getPlans(this.selectedRespo, teamsIds, false, getAll).subscribe(
      (response) => {
        this.workingsDaysEvent.emit(response);
        this.cdRef.detectChanges();
      }
    );
  }

  getLeaderTeamPlan(){
    this.planService.getLeaderTeamPlan().subscribe(
      (response) => {
        this.workingsDaysEvent.emit(response);
        this.cdRef.detectChanges();
      })
  }


  private getMyTeam(): void {
    this.userService
      .getMyTeamNames()
      .subscribe(
        (data) => {
          this.employees = data;
          console.log(this.employees);
          
          this.employeesEvent.emit(this.employees);
        },
        (error) => {
          console.error('Error fetching employees:', error);
        }
      );
  }

}
