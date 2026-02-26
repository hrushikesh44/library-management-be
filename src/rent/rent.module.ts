import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RentController } from './rent.controller';
import { RentService } from './rent.service';
import { BookRental } from './rent.entity';
import { Book } from 'src/books/books.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookRental, Book])],
  controllers: [RentController],
  providers: [RentService],
})
export class RentModule {}
