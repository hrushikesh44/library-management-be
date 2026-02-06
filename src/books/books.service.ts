import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './books.entity';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
  ) {}

  create(dto: CreateBookDto) {
    const book = this.bookRepo.create({
      ...dto,
      availableCopies: dto.totalCopies,
    });

    return this.bookRepo.save(book);
  }

  findAll() {
    return this.bookRepo.find();
  }

  async delete(id: number) {
    const book = await this.bookRepo.findOne({ where: { id } });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return this.bookRepo.remove(book);
  }
}
