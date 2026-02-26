import { Test, TestingModule } from '@nestjs/testing';
import { BuyService } from './buy.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { Book } from 'src/books/books.entity';
import { BookPurchase } from './buy.entity';

describe('BuyService', () => {
  let service: BuyService;
  let bookRepo: jest.Mocked<Repository<Book>>;
  let purchaseRepo: jest.Mocked<Repository<BookPurchase>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuyService,
        {
          provide: getRepositoryToken(Book),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BookPurchase),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(BuyService);
    bookRepo = module.get(getRepositoryToken(Book));
    purchaseRepo = module.get(getRepositoryToken(BookPurchase));
  });

  //buy books

  it('should throw error if book does not exist', async () => {
    bookRepo.findOne.mockResolvedValue(null);

    await expect(service.buyBook(1, 99)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw error if book is out of stock', async () => {
    bookRepo.findOne.mockResolvedValue({
      id: 1,
      availableCopies: 0,
    } as Book);

    await expect(service.buyBook(1, 1)).rejects.toThrow(
      'Book out of stock',
    );
  });

  it('should successfully buy a book', async () => {
    const book = {
      id: 1,
      price: 500,
      availableCopies: 2,
    } as Book;

    bookRepo.findOne.mockResolvedValue(book);
    bookRepo.save.mockResolvedValue(book);

    const purchase = {
      userId: 1,
      bookId: 1,
      price: '500',
    } as BookPurchase;

    purchaseRepo.create.mockReturnValue(purchase);
    purchaseRepo.save.mockResolvedValue(purchase);

    const result = await service.buyBook(1, 1);

    expect(bookRepo.save).toHaveBeenCalledWith({
      ...book,
      availableCopies: 1,
    });

    expect(purchaseRepo.create).toHaveBeenCalledWith({
      userId: 1,
      bookId: 1,
      price: '500',
    });

    expect(result).toEqual({
      message: 'Book purchased successfully',
      bookId: 1,
      price: 500,
    });
  });

  // my purchases

  it('should return purchases with book details', async () => {
    const purchases = [
      { id: 1, userId: 1, bookId: 10 },
      { id: 2, userId: 1, bookId: 20 },
    ] as BookPurchase[];

    const books = [
      { id: 10, title: 'Clean Code' },
      { id: 20, title: 'Refactoring' },
    ] as Book[];

    purchaseRepo.find.mockResolvedValue(purchases);
    bookRepo.find.mockResolvedValue(books);

    const result = await service.getMyPurchases(1);

    expect(purchaseRepo.find).toHaveBeenCalledWith({
      where: { userId: 1 },
      order: { purchasedAt: 'DESC' },
    });

    expect(bookRepo.find).toHaveBeenCalled();

    expect(result).toEqual([
      { ...purchases[0], book: books[0] },
      { ...purchases[1], book: books[1] },
    ]);
  });
});