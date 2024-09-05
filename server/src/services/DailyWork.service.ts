import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyWork } from 'src/entities/DailyWork.entity';
import { CreateDailyWorkDto } from 'src/dto/DailyWork.dto';


@Injectable()
export class DailyWorkService {
  constructor(
    @InjectRepository(DailyWork)
    private readonly dailyWorkRepository: Repository<DailyWork>,
  ) {}

  async create(
    createDailyWorkDto: CreateDailyWorkDto,
    user,
  ): Promise<DailyWork> {
    try {
      const { idCollab, workStatus } = createDailyWorkDto;

      // Create the DailyWork instance
      const dailyWork = this.dailyWorkRepository.create({
        Collab: user,
        workStatus,
      });

      return this.dailyWorkRepository.save(dailyWork);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  async findAll(): Promise<DailyWork[]> {
    try {
      return this.dailyWorkRepository.find();
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  async findOne(id: number): Promise<DailyWork> {
    try {
      const DailyWork = await this.dailyWorkRepository.findOne({
        where: { id },
      });
      if (!DailyWork) {
        throw new NotFoundException(`DailyWork with ID ${id} not found`);
      }
      return DailyWork;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
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
      console.log(error);
      throw new BadRequestException(error);
    }
  }
}
