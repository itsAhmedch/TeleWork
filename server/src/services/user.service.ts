import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './../entities/user.entity';
import { CreateUserDto ,UpdateUserDto} from '../dto/User.dto';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<{"status":string}> {

    const existingUser = await this.userRepository.findOne({where:{ id:id }   });
    
    if (!existingUser) {
      throw new NotFoundException(`User  not found`);
    }
  
   
    const updatedUser = this.userRepository.create({
      ...existingUser,
      ...updateUserDto,
    });
  
    await this.userRepository.save(updatedUser);
    return {"status":"updated"}
  }
  

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
