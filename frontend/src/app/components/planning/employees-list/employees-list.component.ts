import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { TeamsService } from '../../../services/team.service';
import { lastValueFrom } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { planService } from '../../../services/plan.service';

// Interface for Employee
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
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
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
  @Output() RespoEvent = new EventEmitter<number>();
  @Output() workingsDaysEvent = new EventEmitter<any[]>();
  
  Teams: Team[] = [];
  subTeams: Team[] = [];

  constructor(
    private userService: UserService, 
    private planService: planService, 
    private teamsService: TeamsService,
    private cdRef: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    try {
      this.responsibles = await this.loadResponsibles();
      console.log('Loaded responsibles:', this.responsibles);
      this.employeesEvent.emit(this.employees); // Emit employees after responsibles are loaded
    } catch (error) {
      console.error('Error loading responsibles:', error);
      // Consider notifying the user about the error
    }
  }

  // Load responsibles using async/await
  private async loadResponsibles(): Promise<Responsible[]> {
    try {
      const result = await lastValueFrom(this.userService.getRespoList());
      console.log('API Response:', result);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching respo list:', error);
      return [];
    }
  }

  // Load teams when responsible is changed
  onRespoChange() {
    const selectedRespo = this.employeesForm.get('responsible')?.value;
    if (selectedRespo) {
      this.selectedRespo = Number(selectedRespo);
      this.loadTeamsByRespo(this.selectedRespo);
      this.fetchEmployees(); 
      console.log('Selected Respo:', this.selectedRespo); // Debug log
      
      // Emit the selected responsible ID
      this.RespoEvent.emit(this.selectedRespo);
      
    }
  }
  
  getTeamsId(): number[] {
    // Check if subTeams exists, otherwise use Teams
    const teams = this.subTeams ? this.subTeams : this.Teams;

    // Create an array of team IDs
    const ids: number[] = teams.map(team => team.id);

    
    // Return the IDs
    return ids;
}



  // Load teams based on responsible
  loadTeamsByRespo(idRespo: number): void {
    if (idRespo !== -1) {
      
      this.teamsService.getTeamsByRespo(idRespo).subscribe(
        (data) => {
          this.subTeams=[]
          this.Teams = data;

          this.cdRef.detectChanges();
          console.log('Teams loaded successfully:', data);
        },
        (error) => {
          console.error('Error loading teams', error);
          // Notify user about the error
        }
      );
    }
  }

  // Load sub-teams based on responsible and team
  loadSubTeamsByRespo(idRespo: number, idTeam: number): void {
    if (idRespo !== -1 && idTeam !== -1) {
      this.teamsService.getSubTeamsByRespo(idRespo, idTeam).subscribe(
        (data) => {
          this.subTeams = data;
          this.cdRef.detectChanges();
          console.log('Sub-teams loaded successfully:', data);
          this.fetchEmployees(); // Fetch employees after loading subteams
        },
        (error) => {
          console.error('Error loading sub-teams', error);
          // Notify user about the error
        }
      );
    }
  }

  // Fetch employees based on selected responsible and team
  private fetchEmployees() {
    console.log(this.selectedRespo ," " , this.selectedTeamId);
    
    this.userService.getCollabsNames(this.selectedRespo, this.selectedTeamId).subscribe(
      (data) => {
        this.employees = data;
        console.log('Fetched employees:', this.employees);
        this.getPlans()
        this.cdRef.detectChanges();
        this.employeesEvent.emit(this.employees); // Emit the updated employees
        
      },
      (error) => {
        console.error('Error fetching employees:', error);
        // Notify user about the error
      }
    );
  }

  // When team is changed, load corresponding subteams
  onTeamChange(isSubteam:boolean) {
    const selectedTeam = isSubteam?(this.employeesForm.get('subTeam')?.value):(this.employeesForm.get('team')?.value);
    if (selectedTeam) {
      console.log(selectedTeam);
      
      this.selectedTeamId = Number(selectedTeam);
      isSubteam?null:this.loadSubTeamsByRespo(this.selectedRespo, this.selectedTeamId);
      this.fetchEmployees()
   
    }
  }


  getPlans() {
    
      const teamsIds=this.getTeamsId()
      this.planService.getPlans(this.selectedRespo,teamsIds,false).subscribe((response) => {
        
        this.cdRef.detectChanges();
        this.workingsDaysEvent.emit(response)

       
        
      });
  }
}
