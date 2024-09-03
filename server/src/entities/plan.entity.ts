import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Team } from './team.entity';
import { User } from './user.entity';

@Entity()
export class Plan {
  
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Team, team => team.plans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idTeam' })
  team: Team; // Each plan belongs to one team

  @OneToMany(() => User, user => user.plans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idCollab' })
  collab: User; // Each plan belongs to one collab



  @Column({ type: 'int' })
  idCollab: number;

  @Column({ type: 'date' })
  date: Date; 

  @Column({ type: 'bool' })
  proposal: boolean;

 
}
