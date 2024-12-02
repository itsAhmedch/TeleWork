import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import {  takeUntil } from 'rxjs/operators';
import { UserService } from '../../../services/user.service';
import { TeamsService } from '../../../services/team.service';
import { planService } from '../../../services/plan.service';
import { AuthService } from '../../../services/auth.service';
import { Employee, Responsible, Team } from '../../../interfaces/employeesList.interface';



@Component({
  selector: 'app-employees-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employees-list.component.html',
  styleUrls: ['./employees-list.component.scss'],
})

export class EmployeesListComponent implements OnInit, OnDestroy {
  employees: Employee[] = [];
  responsibles: Responsible[] = [];
  teams: Team[] = [];
  subTeams: Team[] = [];
  
  selectedRespo = -1;
  selectedTeamId = -1;
  role: string = '';

  employeesForm :FormGroup;

  @Output() employeesEvent = new EventEmitter<Employee[]>();
  @Output() respoEvent = new EventEmitter<number>();
  @Output() workingsDaysEvent = new EventEmitter<any[]>();
  @Output() getproposalDayEvent = new EventEmitter<any[]>();

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private planService: planService,
    private teamsService: TeamsService,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.employeesForm = this.fb.group({
      responsible: [null], // Use FormBuilder for better readability
      team: [{ value: null, disabled: true }], // Initially disabled
      subTeam: [{ value: null, disabled: true }],
    });
  }
  

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    } else if (this.role === 'respo') {
      this.handleRespoRole(tokenData.id);
    } else if (this.role === 'leader') {
      this.handleLeaderRole();
    }
  }

  private async loadResponsibles(): Promise<void> {
    try {
      this.responsibles = await this.userService.getRespoList().toPromise();
    } catch (error) {
      this.handleError('loading responsibles', error);
    }
  }

  private handleRespoRole(id: number): void {
    this.selectedRespo = id;
    this.respoEvent.emit(this.selectedRespo);
    this.loadTeamsByRespo(this.selectedRespo);
    this.fetchEmployees(false);
    this.employeesForm.get('team')?.enable();
  }

  private handleLeaderRole(): void {
    this.getLeaderTeamPlan();
    this.getMyTeam();
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

    this.employeesForm.get('team')?.setValue(null);
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
    this.userService.getCollabsNames(this.selectedRespo, this.selectedTeamId, getAll)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.employees = data;
          this.getPlans(getAll); 
          this.getProposalPlans(getAll);
          this.employeesEvent.emit(this.employees);
        },
        (error) => this.handleError('fetching employees', error)
      );
  }

  private loadTeamsByRespo(idRespo: number): void {
    if (idRespo !== -1) {
      this.teamsService.getTeamsByRespo(idRespo)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (data) => {
            this.teams = data ?? [];
            this.subTeams = [];
            this.cdRef.detectChanges();
          },
          (error) => this.handleError('loading teams', error)
        );
    }
  }

  onTeamChange(isSubteam: boolean): void {
    const team = this.employeesForm.get('team')?.value ?? '';
    const subTeam = this.employeesForm.get('subTeam')?.value ?? '';

    if (!isSubteam && team !== '') {
      this.selectedTeamId = Number(team);
      this.loadSubTeamsByRespo(this.selectedRespo, this.selectedTeamId);
    } else if (subTeam !== '') {
      this.fetchEmployeesBySubTeam(Number(subTeam));
    } else if (team !== '') {
      this.fetchEmployeesByTeam(this.selectedTeamId);
    } else {
      this.selectedTeamId = -1;
      this.fetchEmployees(false);
    }
    
  }

  private fetchEmployeesByTeam(teamId: number): void {
    this.userService.getCollabsNames(this.selectedRespo, teamId, false)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.employees = data;
          this.emitEvents(false);
        },
        (error) => this.handleError('fetching employees for team', error)
      );
  }

  private fetchEmployeesBySubTeam(subTeamId: number): void {
    this.userService.getCollabsNames(this.selectedRespo, subTeamId, false)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          this.employees = data;
          this.emitEvents(false);
        },
        (error) => this.handleError('fetching employees for subteam', error)
      );
  }

  private loadSubTeamsByRespo(idRespo: number, idTeam: number): void {
    if (idRespo !== -1 && idTeam !== -1) {
      this.teamsService.getSubTeamsByRespo(idRespo, idTeam)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (data) => {
            this.subTeams = data;
            this.employeesForm.get('subTeam')?.enable();
            this.fetchEmployees(false);
          },
          (error) => this.handleError('loading sub-teams', error)
        );
    }
  }

  private getPlans(getAll: boolean): void {
    const teamsIds = this.selectedTeamId === -1 ? this.teams.map((t) => t.id) : [this.selectedTeamId];
    this.planService.getPlans(this.selectedRespo, teamsIds, false, getAll)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response:any) => this.workingsDaysEvent.emit(response));
  }

  private getProposalPlans(getAll: boolean): void {
    const teamsIds = this.selectedTeamId === -1 ? this.teams.map((t) => t.id) : [this.selectedTeamId];
    this.planService.getPlans(this.selectedRespo, teamsIds, true, getAll)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response:any) => 
      {
        
        
        this.getproposalDayEvent.emit(response)
      }
      );
  }

  private getLeaderTeamPlan(): void {
    this.planService.getLeaderTeamPlan()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response:any) => this.workingsDaysEvent.emit(response));
  }

  private getMyTeam(): void {
    this.userService.getMyTeamNames()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data:any) => {
        this.employees = data;
        this.employeesEvent.emit(this.employees);
      });
  }

  private handleError(context: string, error: any): void {
    console.error(`Error occurred while ${context}:`, error);
    // Handle specific error response or notification logic
  }

  private emitEvents(getAll: boolean): void {
    this.employeesEvent.emit(this.employees);
    this.getPlans(getAll);
    this.getProposalPlans(getAll);
  }
}
