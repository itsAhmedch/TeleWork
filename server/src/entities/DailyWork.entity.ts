import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class DailyWork {
  
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.dailyWorks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idCollab'  })
  Collab: User;


  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar', length: 5 })
  times: string;

  @Column({ type: 'bool' })
  workStatus: boolean;




  @BeforeInsert()
  setDefaults() {
    const now = new Date();
    this.date = now.toISOString().split('T')[0]; // Format the date as YYYY-MM-DD
    this.times = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }
}

