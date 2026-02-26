import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';

describe('BooksController', () => {
  let controller: BooksController;
  let service: jest.Mocked<BooksService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(BooksController);
    service = module.get(BooksService);
  });

  // post

  it('should add a book', async () => {
    const dto: CreateBookDto = {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      totalCopies: 5,
    };

    const savedBook = {
      id: 1,
      ...dto,
      availableCopies: 5,
    };

    service.create.mockResolvedValue(savedBook as any);

    const result = await controller.addBook(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result.id).toBe(1);
  });

  //get

  it('should return all books', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    service.findAll.mockResolvedValue([
      { id: 1, title: 'Clean Code' },
      { id: 2, title: 'Refactoring' },
    ] as any);

    const result = await controller.getBooks();

    expect(service.findAll).toHaveBeenCalled();
    expect(result.length).toBe(2);
  });

  // delete

  it('should delete a book by id', async () => {
    const deletedBook = { id: 1, title: 'Clean Code' };

    service.delete.mockResolvedValue(deletedBook as any);

    const result = await controller.deleteBook(1);

    expect(service.delete).toHaveBeenCalledWith(1);
    expect(result.id).toBe(1);
  });
});