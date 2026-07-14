import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get('product/:productId')
  getByProduct(@Param('productId') productId: string) {
    return this.reviewsService.getByProduct(Number(productId));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Request() req: any,
    @Body() body: { product_id: number; rating: number; comment?: string },
  ) {
    return this.reviewsService.create(req.user.id, body.product_id, body.rating, body.comment);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req: any, @Param('id') id: string) {
    return this.reviewsService.remove(req.user.id, Number(id));
  }
}
