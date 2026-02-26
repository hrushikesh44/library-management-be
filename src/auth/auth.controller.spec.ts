import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    service = module.get(AuthService);
  });

  //librarian-test

  it('should return librarian access message', () => {
    const result = controller.testLibrarianAccess();

    expect(result).toBe('librarian access ok');
  });

  //signup

  it('should signup a user', async () => {
    const dto: CreateUserDto = {
      username: 'john',
      password: 'password123',
      role: 'USER' as any,
    };

    service.signup.mockResolvedValue({
      id: 1,
      username: 'john',
    } as any);

    const result = await controller.signup(dto);

    expect(service.signup).toHaveBeenCalledWith(dto);
    expect(result.id).toBe(1);
  });

  //login

  it('should login user and return token', async () => {
    service.login.mockResolvedValue({
      access_token: 'jwt-token',
    } as any);

    const result = await controller.login({
      username: 'john',
      password: 'password123',
    });

    expect(service.login).toHaveBeenCalledWith('john', 'password123');
    expect(result.access_token).toBeDefined();
  });
});