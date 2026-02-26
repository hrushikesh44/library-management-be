import { Test, TestingModule } from '@nestjs/testing';
import { RentController } from './rent.controller';
import { RentService } from './rent.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('RentController', () => {
  let controller: RentController;
  let rentService: jest.Mocked<RentService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RentController],
      providers: [
        {
          provide: RentService,
          useValue: {
            rentBook: jest.fn(),
            returnBook: jest.fn(),
            myRentals: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(RentController);
    rentService = module.get(RentService);
  });

  // rent

  it('should rent a book for the logged-in user', async () => {
    rentService.rentBook.mockResolvedValue({
      message: 'Book rented successfully',
      bookId: 5,
    } as any);

    const req = { user: { userId: 1 } };

    const result = await controller.rentBook(req, 5);

    expect(rentService.rentBook).toHaveBeenCalledWith(1, 5);
    expect(result).toEqual({
      message: 'Book rented successfully',
      bookId: 5,
    });
  });

  // return

  it('should return a rented book', async () => {
    rentService.returnBook.mockResolvedValue({
      message: 'Book returned successfully',
      bookId: 5,
    } as any);

    const req = { user: { userId: 1 } };

    const result = await controller.returnBook(req, 5);

    expect(rentService.returnBook).toHaveBeenCalledWith(1, 5);
    expect(result).toEqual({
      message: 'Book returned successfully',
      bookId: 5,
    });
  });

  // my rentals

  it('should return rentals of the logged-in user', async () => {
    const rentals = [
      { bookId: 1, title: 'Clean Code' },
      { bookId: 2, title: 'DDD' },
    ];

    rentService.myRentals.mockResolvedValue(rentals as any);

    const req = { user: { userId: 1 } };

    const result = await controller.myRentals(req);

    expect(rentService.myRentals).toHaveBeenCalledWith(1);
    expect(result).toEqual(rentals);
  });
});