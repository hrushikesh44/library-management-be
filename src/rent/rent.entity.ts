import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('book_rentals')
export class BookRental {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  bookId!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  rentedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  returnedAt!: Date | null;
}
