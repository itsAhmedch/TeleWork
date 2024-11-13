import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class DailyWork {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar', length: 5 })
  time: string;

  @Column({ type: 'bool' })
  workStatus: boolean;

  @ManyToOne(() => User, (user) => user.dailyWorks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idCollab' })
  Collab: User;

  @BeforeInsert()
  setDefaults() {
    const now = new Date();
    this.date = now.toISOString().split('T')[0]; // Format the date as YYYY-MM-DD
    this.time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }
}
