import { Module } from '@nestjs/common';
import { BuyController } from './buy.controller';
import { BuyService } from './buy.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookPurchase } from './buy.entity';
import { Book } from 'src/books/books.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookPurchase, Book])],
  controllers: [BuyController],
  providers: [BuyService],
})
export class BuyModule {}
