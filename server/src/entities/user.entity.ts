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



export enum Role {
  COLLAB = 'collab',
  LEADER = 'leader',
  RESPO = 'respo',
  ADMIN = 'admin',
}

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;


  @Column({ type: 'varchar', length: 8, unique: true})
  mat: string ;


  @Column({ type: 'enum', enum:Role })
  role: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  lastName: string;

  @Column({ type: 'varchar' })
  pwd: string;



  @OneToMany(() => DailyWork, (dailyWork) => dailyWork.Collab)
  dailyWorks: DailyWork[];

  @OneToMany(() => Team, (team) => team.responsable)
  teams: Team[];

  @ManyToOne(() => Team, team => team.users) // Assuming a many-to-one relationship
  @JoinColumn({ name: 'idTeam' }) // Specify the foreign key
  team: Team

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
