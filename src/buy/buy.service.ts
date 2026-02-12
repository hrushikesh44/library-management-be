import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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

  // async getMyPurchases(userId: number) {
  //   return this.purchaseRepo.find({
  //     where: { userId },
  //     order: { purchasedAt: 'DESC' },
  //   });
  // }

  async getMyPurchases(userId: number) {
    const purchases = await this.purchaseRepo.find({
      where: { userId },
      order: { purchasedAt: 'DESC' },
    });

    const bookIds = purchases.map((p) => p.bookId);

    const books = await this.bookRepo.find({
      where: { id: In(bookIds) },
    });

    const bookMap = new Map(books.map((book) => [book.id, book]));

    return purchases.map((purchase) => ({
      ...purchase,
      book: bookMap.get(purchase.bookId),
    }));
  }
}
