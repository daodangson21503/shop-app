import { Module } from '@nestjs/common';
import { SlidersController } from './sliders.controller';
import { SlidersService } from './sliders.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SlidersController],
  providers: [SlidersService],
  exports: [SlidersService],
})
export class SlidersModule {}
