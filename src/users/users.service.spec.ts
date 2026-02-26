import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);
    usersRepo = module.get(getRepositoryToken(User));
  });

  //create

  it('should create and save a new user', async () => {
    const user = {
      userId: 1,
      username: 'john',
      password: 'hashed-password',
    } as User;

    usersRepo.create.mockReturnValue(user);
    usersRepo.save.mockResolvedValue(user);

    const result = await service.create('john', 'hashed-password');

    expect(usersRepo.create).toHaveBeenCalledWith({
      username: 'john',
      password: 'hashed-password',
    });

    expect(usersRepo.save).toHaveBeenCalledWith(user);
    expect(result).toEqual(user);
  });

  // findone

  it('should return user if found', async () => {
    const user = { username: 'john' } as User;

    usersRepo.findOne.mockResolvedValue(user);

    const result = await service.findOne('john');

    expect(usersRepo.findOne).toHaveBeenCalledWith({
      where: { username: 'john' },
    });
    expect(result).toEqual(user);
  });

  it('should return null if user not found', async () => {
    usersRepo.findOne.mockResolvedValue(null);

    const result = await service.findOne('unknown');

    expect(result).toBeNull();
  });
});