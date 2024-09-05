import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Team } from './team.entity';
import { User } from './user.entity';

@Entity()
export class Plan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'bool' })
  proposal: boolean;

  @ManyToOne(() => User, (user) => user.plans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idCollab' })
  collab: User;

  @ManyToOne(() => Team, (team) => team.plans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idTeam' })
  team: Team; // Each plan belongs to one team
}
