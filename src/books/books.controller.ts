import { Controller, Post } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/users.entity';

@Controller('books')
export class BooksController {
  @Roles(Role.ADMIN, Role.USER)
  @Post()
  createBook() {
    return 'Only admin can create books';
  }
}
