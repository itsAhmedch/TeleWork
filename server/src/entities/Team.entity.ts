import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Plan } from './plan.entity';

@Entity('team')
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30 })
  name: string;

  @Column({ default:null })
  idTeam: number | null;


  @ManyToOne(() => User, user => user.teams, { onDelete: 'SET NULL' }) // Set to SET NULL or other appropriate action
  @JoinColumn({ name: 'idRespo' })
  responsable: User;

  @OneToOne(() => User, user => user.leadTeam, { onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'idLeader' })
  leader: User;


  @OneToMany(() => Plan, plan => plan.team)
  plans: Plan[]; // Each team can have multiple plans, but we'll enforce a limit of 2 in the service
}


