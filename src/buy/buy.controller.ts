import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { BuyService } from './buy.service';

@UseGuards(JwtAuthGuard)
@Controller('buy')
export class BuyController {
  constructor(private buyService: BuyService) {}

  @Post(':bookId')
  buyBook(@Param('bookId') bookId: number, @Req() req) {
    return this.buyService.buyBook(req.user.userId, bookId);
  }

  @Get('my')
  getMyPurchases(@Req() req) {
    return this.buyService.getMyPurchases(req.user.userId);
  }
}
