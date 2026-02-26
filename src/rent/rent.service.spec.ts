import { Test, TestingModule } from '@nestjs/testing';
import { RentService } from './rent.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { BookRental } from './rent.entity';
import { Book } from 'src/books/books.entity';

describe('RentService', () => {
  let service: RentService;
  let rentalRepo: jest.Mocked<Repository<BookRental>>;
  let bookRepo: jest.Mocked<Repository<Book>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RentService,
        {
          provide: getRepositoryToken(BookRental),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Book),
          useValue: {
            findOneBy: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(RentService);
    rentalRepo = module.get(getRepositoryToken(BookRental));
    bookRepo = module.get(getRepositoryToken(Book));
  });

  //rent

  it('should throw error if book is not available', async () => {
    bookRepo.findOneBy.mockResolvedValue(null);

    await expect(service.rentBook(1, 10)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw error if book has no copies', async () => {
    bookRepo.findOneBy.mockResolvedValue({
      id: 10,
      availableCopies: 0,
    } as Book);

    await expect(service.rentBook(1, 10)).rejects.toThrow(
      'Book not available',
    );
  });

  it('should throw error if book is already rented', async () => {
    bookRepo.findOneBy.mockResolvedValue({
      id: 10,
      availableCopies: 2,
    } as Book);

    rentalRepo.findOne.mockResolvedValue({
      bookId: 10,
      returnedAt: null,
    } as BookRental);

    await expect(service.rentBook(1, 10)).rejects.toThrow(
      'Book not availble for Rent',
    );
  });

  it('should rent a book successfully', async () => {
    const book = {
      id: 10,
      availableCopies: 2,
    } as Book;

    bookRepo.findOneBy.mockResolvedValue(book);
    rentalRepo.findOne.mockResolvedValue(null);
    rentalRepo.save.mockResolvedValue({} as BookRental);
    bookRepo.save.mockResolvedValue(book);

    const result = await service.rentBook(1, 10);

    expect(rentalRepo.save).toHaveBeenCalledWith({
      userId: 1,
      bookId: 10,
    });

    expect(bookRepo.save).toHaveBeenCalledWith({
      ...book,
      availableCopies: 1,
    });

    expect(result).toEqual({
      message: 'Book Rented Successfully',
    });
  });

  //return

  it('should throw error if no active rental found', async () => {
    rentalRepo.findOne.mockResolvedValue(null);

    await expect(service.returnBook(1, 10)).rejects.toThrow(
      'No active rental found',
    );
  });

  it('should throw error if book not found while returning', async () => {
    rentalRepo.findOne.mockResolvedValue({
      userId: 1,
      bookId: 10,
      returnedAt: null,
    } as BookRental);

    bookRepo.findOneBy.mockResolvedValue(null);

    await expect(service.returnBook(1, 10)).rejects.toThrow(
      'Book not found',
    );
  });

  it('should return book successfully', async () => {
    const rental = {
      userId: 1,
      bookId: 10,
      returnedAt: null,
    } as BookRental;

    const book = {
      id: 10,
      availableCopies: 1,
    } as Book;

    rentalRepo.findOne.mockResolvedValue(rental);
    rentalRepo.save.mockResolvedValue(rental);
    bookRepo.findOneBy.mockResolvedValue(book);
    bookRepo.save.mockResolvedValue(book);

    const result = await service.returnBook(1, 10);

    expect(rentalRepo.save).toHaveBeenCalled();
    expect(bookRepo.save).toHaveBeenCalledWith({
      ...book,
      availableCopies: 2,
    });

    expect(result).toEqual({
      message: 'Book returned successfully',
    });
  });

  // my rentals

  it('should return active rentals with book details', async () => {
    const rentals = [
      { id: 1, userId: 1, bookId: 10 },
      { id: 2, userId: 1, bookId: 20 },
    ] as BookRental[];

    const books = [
      { id: 10, title: 'Clean Code' },
      { id: 20, title: 'DDD' },
    ] as Book[];

    rentalRepo.find.mockResolvedValue(rentals);
    bookRepo.find.mockResolvedValue(books);

    const result = await service.myRentals(1);

    expect(rentalRepo.find).toHaveBeenCalledWith({
      where: { userId: 1, returnedAt: IsNull() },
    });

    expect(result).toEqual([
      { ...rentals[0], book: books[0] },
      { ...rentals[1], book: books[1] },
    ]);
  });
});