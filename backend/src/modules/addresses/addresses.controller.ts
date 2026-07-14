import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AddressesService } from './addresses.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private addressesService: AddressesService) {}

  @Get()
  list(@Req() req: Request) {
    return this.addressesService.listByUser((req as any).user.id);
  }

  @Post()
  create(@Req() req: Request, @Body() body: any) {
    return this.addressesService.create((req as any).user.id, body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Req() req: Request, @Body() body: any) {
    return this.addressesService.update(Number(id), (req as any).user.id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.addressesService.remove(Number(id), (req as any).user.id);
  }
}
