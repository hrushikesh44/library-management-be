import { Test, TestingModule } from '@nestjs/testing';
import { BuyController } from './buy.controller';
import { BuyService } from './buy.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

describe('BuyController', () => {
  let controller: BuyController;
  let buyService: jest.Mocked<BuyService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuyController],
      providers: [
        {
          provide: BuyService,
          useValue: {
            buyBook: jest.fn(),
            getMyPurchases: jest.fn(),
          },
        },
      ],
    })
      // 👇 override guard so it doesn't block controller
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(BuyController);
    buyService = module.get(BuyService);
  });

  // buy

  it('should buy a book for the logged-in user', async () => {
    buyService.buyBook.mockResolvedValue({
      success: true,
      bookId: 10,
    } as any);

    const req = {
      user: { userId: 1 },
    };

    const result = await controller.buyBook(10, req);

    expect(buyService.buyBook).toHaveBeenCalledWith(1, 10);
    expect(result).toEqual({
      success: true,
      bookId: 10,
    });
  });

  //my purchases

  it('should return purchases of the logged-in user', async () => {
    const purchases = [
      { bookId: 1, title: 'Clean Code' },
      { bookId: 2, title: 'Refactoring' },
    ];

    buyService.getMyPurchases.mockResolvedValue(purchases as any);

    const req = {
      user: { userId: 1 },
    };

    const result = await controller.getMyPurchases(req);

    expect(buyService.getMyPurchases).toHaveBeenCalledWith(1);
    expect(result).toEqual(purchases);
  });
});