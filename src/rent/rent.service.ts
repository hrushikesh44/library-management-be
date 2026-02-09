import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { BookRental } from './rent.entity';
import { Book } from 'src/books/books.entity';

@Injectable()
export class RentService {
  constructor(
    @InjectRepository(BookRental)
    private rentalRepo: Repository<BookRental>,

    @InjectRepository(Book)
    private bookRepo: Repository<Book>,
  ) {}

  async rentBook(userId: number, bookId: number) {
    const book = await this.bookRepo.findOneBy({ id: bookId });

    if (!book || !book.isAvailable) {
      throw new BadRequestException('Book not available');
    }

    const existingRental = await this.rentalRepo.findOne({
      where: {
        bookId,
        returnedAt: IsNull(),
      },
    });

    if (existingRental) {
      throw new BadRequestException('Book not availble for Rent');
    }

    await this.rentalRepo.save({
      userId,
      bookId,
    });

    book.isAvailable = false;
    await this.bookRepo.save(book);

    return { message: 'Book Rented Successfully' };
  }

  async returnBook(userId: number, bookId: number) {
    const rental = await this.rentalRepo.findOne({
      where: {
        userId,
        bookId,
        returnedAt: IsNull(),
      },
    });

    if (!rental) {
      throw new BadRequestException('No active rental found');
    }

    rental.returnedAt = new Date();
    await this.rentalRepo.save(rental);

    await this.bookRepo.update(bookId, { isAvailable: true });

    return { message: 'Book returned successfully' };
  }

  async myRentals(userId: number) {
    return this.rentalRepo.find({
      where: { userId, returnedAt: IsNull() },
    });
  }
}
