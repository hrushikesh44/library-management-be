import { Controller, Post, Param, Req, Get, UseGuards } from '@nestjs/common';
import { RentService } from './rent.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('rent')
export class RentController {
  constructor(private readonly rentService: RentService) {}

  @Post(':bookId')
  rentBook(@Req() req, @Param('bookId') bookId: number) {
    return this.rentService.rentBook(req.user.userId, bookId);
  }

  @Post('return/:rentalId')
  returnBook(@Req() req, @Param('rentalId') rentalId: number) {
    return this.rentService.returnBook(req.user.userId, rentalId);
  }

  @Get('my')
  myRentals(@Req() req) {
    return this.rentService.myRentals(req.user.userId);
  }
}
