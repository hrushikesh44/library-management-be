import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('book_purchases')
export class BookPurchase {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  bookId!: number;

  @Column('numeric')
  price!: string;

  @CreateDateColumn()
  purchasedAt!: Date;
}
