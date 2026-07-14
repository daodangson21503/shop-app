import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('vouchers')
export class VouchersController {
  constructor(private vouchersService: VouchersService) {}

  @Get('available')
  listAvailable(@Query('orderAmount') orderAmount?: string) {
    return this.vouchersService.listAvailable(Number(orderAmount) || 0);
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  validate(@Body() body: { code: string; orderAmount: number }) {
    return this.vouchersService.validateAndApply(body.code, body.orderAmount);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  list() {
    return this.vouchersService.list();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() body: any) {
    return this.vouchersService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() body: any) {
    return this.vouchersService.update(Number(id), body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.vouchersService.remove(Number(id));
  }
}
