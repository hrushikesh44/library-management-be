import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { Book } from './books.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('BooksService', () => {
  let service: BooksService;
  let repo: jest.Mocked<Repository<Book>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(Book),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(BooksService);
    repo = module.get(getRepositoryToken(Book));
  });

  //create

  it('should create a book with availableCopies equal to totalCopies', async () => {
    const dto = {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      totalCopies: 5,
    };

    const createdBook = {
      id: 1,
      ...dto,
      availableCopies: 5,
    };

    repo.create.mockReturnValue(createdBook as Book);
    repo.save.mockResolvedValue(createdBook as Book);

    const result = await service.create(dto);

    expect(repo.create).toHaveBeenCalledWith({
      ...dto,
      availableCopies: dto.totalCopies,
    });
    expect(repo.save).toHaveBeenCalledWith(createdBook);
    expect(result.availableCopies).toBe(5);
  });

  //findall

  it('should return all books', async () => {
    const books = [
      { id: 1, title: 'Clean Code' },
      { id: 2, title: 'Refactoring' },
    ];

    repo.find.mockResolvedValue(books as Book[]);

    const result = await service.findAll();

    expect(repo.find).toHaveBeenCalled();
    expect(result.length).toBe(2);
  });

  //delete
  it('should delete a book if it exists', async () => {
    const book = { id: 1, title: 'Clean Code' };

    repo.findOne.mockResolvedValue(book as Book);
    repo.remove.mockResolvedValue(book as Book);

    const result = await service.delete(1);

    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(repo.remove).toHaveBeenCalledWith(book);
    expect(result).toEqual(book);
  });

  it('should throw NotFoundException if book does not exist', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.delete(99)).rejects.toThrow(NotFoundException);
    expect(repo.remove).not.toHaveBeenCalled();
  });
});