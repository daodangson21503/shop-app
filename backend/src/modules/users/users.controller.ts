import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('stats')
  getStats() {
    return this.usersService.getStats();
  }

  @Get()
  listAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    const pageVal = Number(page);
    const limitVal = Number(limit);
    return this.usersService.listAll({
      page: !isNaN(pageVal) && pageVal > 0 ? pageVal : 1,
      limit: !isNaN(limitVal) && limitVal > 0 ? limitVal : 20,
      search: search ?? '',
    });
  }

  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: string) {
    return this.usersService.toggleStatus(id);
  }
}
