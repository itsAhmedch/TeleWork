import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Team } from './team.entity';
import { User } from './user.entity';
@Unique(['collab', 'team', 'date', 'isProposal']) // Add a unique constraint here
@Entity()
export class Plan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({  })
  date: string;

  @Column({ type: 'bool' })
  isProposal: boolean;

  @ManyToOne(() => User, (user) => user.plans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idCollab' })
  collab: User;

  @ManyToOne(() => Team, (team) => team.plans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idTeam' })
  team: Team; // Each plan belongs to one team
}
