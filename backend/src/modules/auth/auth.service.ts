import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId) {
      this.googleClient = new OAuth2Client(clientId);
    }
  }

  private signToken(user: { id: string; role: string; email: string }) {
    return this.jwtService.signAsync({ id: user.id, role: user.role, email: user.email });
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!user.passwordHash) throw new UnauthorizedException('Account uses Google login');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = await this.signToken(user);
    return {
      token,
      user: { id: user.id, full_name: user.fullName, role: user.role },
    };
  }

  async register(fullName: string, email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('Email đã được sử dụng');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { fullName, email, passwordHash, role: 'customer' },
    });

    return { id: user.id, email: user.email, fullName: user.fullName };
  }

  async googleLogin(credential: string) {
    if (!this.googleClient) {
      throw new BadRequestException('Google login is not configured');
    }

    let payload: any;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      this.logger.error('Google token verification failed', err);
      throw new UnauthorizedException('Invalid Google credential');
    }

    const googleId = payload['sub'];
    const email = payload['email'];
    const fullName = payload['name'] || email.split('@')[0];

    if (!email) {
      throw new BadRequestException('Google account must have an email');
    }

    let user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId, provider: 'google' },
        });
      }
    } else {
      user = await this.prisma.user.create({
        data: {
          fullName,
          email,
          passwordHash: null,
          provider: 'google',
          googleId,
          role: 'customer',
        },
      });
    }

    const token = await this.signToken(user);
    return {
      token,
      user: { id: user.id, full_name: user.fullName, role: user.role },
    };
  }
}
