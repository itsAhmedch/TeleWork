import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyWork } from 'src/entities/DailyWork.entity';
import { CreateDailyWorkDto } from 'src/dto/DailyWork.dto';
import { User } from 'src/entities/user.entity';
import { PlanService } from './Plan.service';


@Injectable()
export class DailyWorkService {
  constructor(
    @InjectRepository(DailyWork)
    private readonly dailyWorkRepository: Repository<DailyWork>,
    private PlanService: PlanService,
  ) {}

  async create(user: User): Promise<DailyWork> {
    try {
      const isTodayWorkingDays = this.checkIfTodayIsWorkingDay(user.id);
      if (isTodayWorkingDays) {
        // Fetch the last working day for the collaborator
        const lastDailyWork = await this.dailyWorkRepository.find({
          where: { Collab: { id: user.id } },
          order: { id: 'DESC' },
          select: ['id', 'workStatus', 'date', 'time'], // Select necessary fields including id

          take: 1, // Limit to 1 record to mimic findOne behavior
        });

      

        // Determine the new work status
        const lastStatus =
          lastDailyWork.length > 0 ? lastDailyWork[0].workStatus : false;
        const workStatus = lastDailyWork ? !lastStatus : true; // Default to true if no previous work
       

        // Prepare the current date and time as strings
        const currentDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
        const currentTimes = `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`; // Format as HH:mm

        // Create the DailyWork instance with strings for date and time
        const dailyWork = this.dailyWorkRepository.create({
          Collab: user,
          workStatus: workStatus,
          date: currentDate, // Use formatted current date
          time: currentTimes, // Use formatted current time
        });

        return await this.dailyWorkRepository.save(dailyWork);
      } else {
        throw new BadRequestException('Invalid working days');
      }
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async checkIfTodayIsWorkingDay(userId: number): Promise<boolean> {
    try {
      // Fetch the list of working days for the collaborator
      const listOfWorkingDays = await this.PlanService.findByCollab(
        userId,
        false,
      );

      // Format today's date as YYYY-MM-DD
      const formattedToday = new Date().toISOString().split('T')[0];

      // Check if today is a working day
      const isTodayWorkingDay = listOfWorkingDays.some(
        (day) => day.date === formattedToday,
      );
    
      

      return isTodayWorkingDay; // Returns true if today is a working day, false otherwise
    } catch (error) {
      console.error('Error checking if today is a working day:', error);
      throw new BadRequestException('Could not check working day status');
    }
  }

  async findByCollab(idCollab: number): Promise<DailyWork[]> {
    try {
      const dailyWorks = await this.dailyWorkRepository.find({
        where: { Collab: { id: idCollab } },
      });
      if (dailyWorks.length === 0) {
        throw new NotFoundException(
          `No DailyWork entries found for collab with ID ${idCollab}`,
        );
      }
      return dailyWorks;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async getMyStatus(user: User) {
    const lastDailyWork = await this.dailyWorkRepository.findOne({
      where: { Collab: { id: user.id } },
      order: { id: 'DESC' },
      select: ['id', 'workStatus', 'date', 'time'], // Select necessary fields including id
    });

  

    const MyInfo = {
      time: this.get_Time(),
      status: lastDailyWork?lastDailyWork.workStatus:true,
      lastClickTime: lastDailyWork?lastDailyWork.time:'',
      currentDate: this.get_Day(),
      isworkingDay: await this.checkIfTodayIsWorkingDay(user.id)
    };
    console.log(MyInfo);
    
    return MyInfo;
  }

  get_Time(){
    const date = new Date();
    const offset = date.getTimezoneOffset() / 60;  // Get the offset in hours
    date.setHours(date.getHours() - offset);

    return  date.toISOString().split('T')[1].slice(0, 5);
  }
  
  get_Day(){
    const date = new Date();
    const offset = date.getTimezoneOffset() / 60;  // Get the offset in hours
    date.setHours(date.getHours() - offset);

    return  date.toISOString().split('T')[0];
  
  }

  calculDuration(DailyWork) {
    let start = ''; // hh:mm
    let end = ''; // hh:mm
    let totalDuration = 0; // total duration in minutes

    for (let index = 0; index < DailyWork.length; index++) {
      const time = DailyWork[index].time;
      const status = DailyWork[index].workStatus;

      if (status) {
        // Work started, set the start time
        start = time;
      } else {
        // Work ended, set the end time and calculate the duration
        end = time;

        // Parse start and end times into Date objects
        const [startHours, startMinutes] = start.split(':').map(Number);
        const [endHours, endMinutes] = end.split(':').map(Number);

        // Create Date objects for start and end times (using arbitrary dates)
        const startDate = new Date(0, 0, 0, startHours, startMinutes);
        const endDate = new Date(0, 0, 0, endHours, endMinutes);

        // Calculate the difference in minutes and add to total duration
        const duration =
          (endDate.getTime() - startDate.getTime()) / (1000 * 60); // difference in minutes
        totalDuration += duration;
      }
    }

    // Convert total duration back to hh:mm format
    const hours = Math.floor(totalDuration / 60);
    const minutes = totalDuration % 60;
    const duration = `${hours.toString().padStart(2, '0')}h${minutes.toString().padStart(2, '0')}m`;
    return duration;
  }

  async getDayStatus(user: User, date: string) {
 

    const DailyWork = await this.dailyWorkRepository.find({
      where: { Collab: { id: user.id }, date: date },
      order: { id: 'ASC' },

      select: ['workStatus', 'time'],
    });

    const DailyWorkInfo = {
      DailyWork: DailyWork,
      duration: this.calculDuration(DailyWork),
    };

    return DailyWorkInfo;
  }


}
