import { Controller, Get, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  list(@Request() req: any, @Query('unread') unread?: string) {
    const onlyUnread = unread === 'true';
    return this.notificationsService.listByUser(req.user.id, { onlyUnread });
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  async unreadCount(@Request() req: any) {
    const count = await this.notificationsService.countUnread(req.user.id);
    return { count };
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  markRead(@Request() req: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(Number(id), req.user.id);
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  markAllRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }
}
