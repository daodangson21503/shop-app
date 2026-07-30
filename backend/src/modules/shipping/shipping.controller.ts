import { Controller, Get, Query } from '@nestjs/common';
import { ShippingService } from './shipping.service';

@Controller('shipping')
export class ShippingController {
  constructor(private shippingService: ShippingService) {}

  @Get('calculate')
  async calculate(
    @Query('province') province: string,
    @Query('subtotal') subtotal: string,
    @Query('weight') weight: string,
  ) {
    return this.shippingService.calculate(province || '', Number(subtotal) || 0, Number(weight) || 0);
  }

  @Get('provinces')
  async getProvinces() {
    return this.shippingService.getProvinces();
  }
}
