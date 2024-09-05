import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Team } from './team.entity'; // Assuming the Team entity is in the same directory
import { DailyWork } from './DailyWork.entity';
import { Plan } from './plan.entity';
import * as bcrypt from 'bcrypt';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 11 })
  role: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  lastName: string;

  @Column({ type: 'varchar', length: 30 })
  pwd: string;

  @Column({ type: 'varchar', length: 30 })
  serviceName: string;

  @Column({ default: null })
  idTeam: number | null;

  @OneToMany(() => DailyWork, (dailyWork) => dailyWork.Collab)
  dailyWorks: DailyWork[];

  @OneToMany(() => Team, (team) => team.responsable)
  teams: Team[];

  @OneToOne(() => Team, (team) => team.leader)
  leadTeam: Team;

  @OneToMany(() => Plan, (plan) => plan.collab)
  plans: Plan[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    const salt = await bcrypt.genSalt(10);
    this.pwd = await bcrypt.hash(this.pwd, salt);

  }
}
