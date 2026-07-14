import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  list(@Request() req: any) {
    return this.wishlistService.getByUser(req.user.id);
  }

  @Post()
  add(@Request() req: any, @Body('product_id') productId: number) {
    return this.wishlistService.add(req.user.id, productId);
  }

  @Delete(':productId')
  remove(@Request() req: any, @Param('productId') productId: string) {
    return this.wishlistService.remove(req.user.id, Number(productId));
  }
}
