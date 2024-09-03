import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyWork } from 'src/entities/DailyWork.entity';
import { CreateDailyWorkDto } from 'src/dto/DailyWork.dto';
import { User } from 'src/entities/user.entity';

@Injectable()
export class DailyWorkService {
  constructor(
    @InjectRepository(DailyWork)
    private readonly dailyWorkRepository: Repository<DailyWork>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createDailyWorkDto: CreateDailyWorkDto): Promise<DailyWork> {
    const { idCollab, workStatus } = createDailyWorkDto;

   

    // Fetch the user by ID
    const user = await this.userRepository.findOne({ where: { id: idCollab } });

    // Handle the error and throw HttpException
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Create the DailyWork instance
    const dailyWork = this.dailyWorkRepository.create({
      Collab: user,
      workStatus,
    });

    return this.dailyWorkRepository.save(dailyWork);
  }


  async findAll(): Promise<DailyWork[]> {
    return this.dailyWorkRepository.find();
  }

  async findOne(id: number): Promise<DailyWork> {
    const DailyWork = await this.dailyWorkRepository.findOne({ where: { id } });
    if (!DailyWork) {
      throw new NotFoundException(`DailyWork with ID ${id} not found`);
    }
    return DailyWork;
  }

  async findByCollab(idCollab: number): Promise<DailyWork[]> {
    const dailyWorks = await this.dailyWorkRepository.find({ where: { Collab: { id: idCollab } } });
    if (dailyWorks.length === 0) {
      throw new NotFoundException(`No DailyWork entries found for collab with ID ${idCollab}`);
    }
    return dailyWorks;
  }


 
}
