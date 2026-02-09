import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from 'src/books/books.entity';
import { BookPurchase } from './buy.entity';

@Injectable()
export class BuyService {
  constructor(
    @InjectRepository(Book)
    private bookRepo: Repository<Book>,

    @InjectRepository(BookPurchase)
    private purchaseRepo: Repository<BookPurchase>,
  ) {}

  async buyBook(userId: number, bookId: number) {
    const book = await this.bookRepo.findOne({ where: { id: bookId } });

    if (!book) {
      throw new BadRequestException('Book not found');
    }

    if (book.availableCopies <= 0) {
      throw new BadRequestException('Book out of stock');
    }

    book.availableCopies -= 1;
    await this.bookRepo.save(book);

    const purchase = this.purchaseRepo.create({
      userId,
      bookId,
      price: book.price.toString(),
    });

    await this.purchaseRepo.save(purchase);

    return {
      message: 'Book purchased successfully',
      bookId,
      price: book.price,
    };
  }

  async getMyPurchases(userId: number) {
    return this.purchaseRepo.find({
      where: { userId },
      order: { purchasedAt: 'DESC' },
    });
  }
}
