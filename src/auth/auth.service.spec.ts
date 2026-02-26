jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  //signup

  it('should signup a new user successfully', async () => {
    usersService.findOne.mockResolvedValue(null);

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    usersService.create.mockResolvedValue({
      userId: 1,
      username: 'john',
    } as any);

    const result = await service.signup({
      username: 'john',
      password: 'password123',
      role: 'USER' as any,
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(result).toEqual({
      userId: 1,
      username: 'john',
    });
  });

  it('should throw BadRequestException if username exists', async () => {
    usersService.findOne.mockResolvedValue({ username: 'john' } as any);

    await expect(
      service.signup({
        username: 'john',
        password: 'password123',
        role: 'USER' as any,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  //login

  it('should login successfully and return access token', async () => {
    usersService.findOne.mockResolvedValue({
      userId: 1,
      username: 'john',
      password: 'hashed-password',
      roles: ['USER'],
    } as any);

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtService.sign.mockReturnValue('jwt-token');

    const result = await service.login('john', 'password123');

    expect(bcrypt.compare).toHaveBeenCalledWith(
      'password123',
      'hashed-password',
    );
    expect(result.access_token).toBe('jwt-token');
  });

  it('should throw UnauthorizedException if user not found', async () => {
    usersService.findOne.mockResolvedValue(null);

    await expect(service.login('john', 'password123')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if password is incorrect', async () => {
    usersService.findOne.mockResolvedValue({
      userId: 1,
      username: 'john',
      password: 'hashed-password',
      roles: ['USER'],
    } as any);

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.login('john', 'wrong-password')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
