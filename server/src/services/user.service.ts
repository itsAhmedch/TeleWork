import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dto/User.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = this.userRepository.create(createUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userRepository.find();
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException(`User not found`);
      }
      return user;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<{ status: string }> {
    try {
      const existingUser = await this.userRepository.findOneBy({ id });

      if (!existingUser) {
        throw new NotFoundException(`User  not found`);
      }

      const updatedUser = this.userRepository.create({
        ...existingUser,
        ...updateUserDto,
      });

      await this.userRepository.save(updatedUser);
      return { status: 'updated' };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.userRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Plan with ID ${id} not found`);
      }
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }
}
