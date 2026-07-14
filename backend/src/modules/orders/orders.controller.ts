import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  create(@Body() body: any) {
    return this.ordersService.create(body);
  }

  @Get('track/:id')
  trackByPhone(@Param('id') id: string, @Query('phone') phone: string) {
    return this.ordersService.trackByPhone(id, phone);
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  getMyOrders(@Request() req: any) {
    return this.ordersService.getByUserId(req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  listAll() {
    return this.ordersService.listAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getById(@Param('id') id: string) {
    return this.ordersService.getById(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancelOrder(@Param('id') id: string, @Request() req: any) {
    return this.ordersService.cancelOrder(id, req.user.id);
  }
}
