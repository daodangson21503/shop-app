import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  async register(@Body() body: { fullName: string; email: string; password: string }) {
    return this.authService.register(body.fullName, body.email, body.password);
  }

  @Post('google')
  async googleLogin(@Body() body: { credential: string }) {
    return this.authService.googleLogin(body.credential);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Request() req: any) {
    return req.user;
  }
}
