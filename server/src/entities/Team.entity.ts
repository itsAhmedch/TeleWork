import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Plan } from './plan.entity';

@Entity('team')
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30 })
  name: string;


  
  @ManyToOne(() => Team, (team) => team.childTeams, { onDelete: 'CASCADE', nullable: true })  // Set to nullable
  @JoinColumn({ name: 'idTeam' })  
  parentTeam: Team | null = null;  
    
  
  @OneToMany(() => Team, (team) => team.parentTeam)
  childTeams: Team[];

  @ManyToOne(() => User, (user) => user.teams, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'idRespo' })
  responsable: User;

  @OneToMany(() => User, (user) => user.teams, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'idCollab' })
  users: User;

  @OneToOne(() => User, (user) => user.leadTeam, { onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'idLeader' })
  leader: User | null;

  @OneToMany(() => Plan, (plan) => plan.team)
  plans: Plan[];
}
