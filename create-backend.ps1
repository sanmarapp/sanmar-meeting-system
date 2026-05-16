# Sanmar NestJS Backend - File Generator Script
# Run this from: D:\AIWorkspace\projects\sanmar-meeting-system\sanmar-meeting-system
# Usage: .\create-backend.ps1

$base = "apps\backend\src"

# Create all directories
$dirs = @(
  "$base",
  "$base\prisma",
  "$base\auth",
  "$base\auth\dto",
  "$base\users",
  "$base\bookings",
  "$base\rooms",
  "$base\site-visits"
)
foreach ($dir in $dirs) {
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
}
Write-Host "✅ Directories created"

# ============================================================
# FILE: main.ts
# ============================================================
Set-Content "$base\main.ts" @'
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Sanmar Backend running on http://localhost:${port}/api`);
}
bootstrap();
'@

# ============================================================
# FILE: app.module.ts
# ============================================================
Set-Content "$base\app.module.ts" @'
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BookingsModule } from './bookings/bookings.module';
import { RoomsModule } from './rooms/rooms.module';
import { SiteVisitsModule } from './site-visits/site-visits.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    BookingsModule,
    RoomsModule,
    SiteVisitsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
'@

# ============================================================
# FILE: app.controller.ts
# ============================================================
Set-Content "$base\app.controller.ts" @'
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Sanmar Meeting System API',
    };
  }
}
'@

# ============================================================
# FILE: app.service.ts
# ============================================================
Set-Content "$base\app.service.ts" @'
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Sanmar Meeting System API';
  }
}
'@

# ============================================================
# FILE: prisma/prisma.module.ts
# ============================================================
Set-Content "$base\prisma\prisma.module.ts" @'
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
'@

# ============================================================
# FILE: prisma/prisma.service.ts
# ============================================================
Set-Content "$base\prisma\prisma.service.ts" @'
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
'@

# ============================================================
# FILE: auth/auth.module.ts
# ============================================================
Set-Content "$base\auth\auth.module.ts" @'
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRATION') || '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
'@

# ============================================================
# FILE: auth/auth.controller.ts
# ============================================================
Set-Content "$base\auth\auth.controller.ts" @'
import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.userId, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { message: 'Logged out successfully' };
  }
}
'@

# ============================================================
# FILE: auth/auth.service.ts
# ============================================================
Set-Content "$base\auth\auth.service.ts" @'
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { department: true, locations: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const payload = { userId: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
      mustChangePassword: user.mustChangePassword,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { department: true, locations: true },
    });

    if (!user) throw new UnauthorizedException('User not found');

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) throw new BadRequestException('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword, mustChangePassword: false },
    });

    return { message: 'Password changed successfully' };
  }
}
'@

# ============================================================
# FILE: auth/jwt.strategy.ts
# ============================================================
Set-Content "$base\auth\jwt.strategy.ts" @'
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user || !user.isActive) throw new UnauthorizedException();
    return { userId: user.id, email: user.email, role: user.role };
  }
}
'@

# ============================================================
# FILE: auth/jwt-auth.guard.ts
# ============================================================
Set-Content "$base\auth\jwt-auth.guard.ts" @'
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
'@

# ============================================================
# FILE: auth/dto/login.dto.ts
# ============================================================
Set-Content "$base\auth\dto\login.dto.ts" @'
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
'@

# ============================================================
# FILE: auth/dto/change-password.dto.ts
# ============================================================
Set-Content "$base\auth\dto\change-password.dto.ts" @'
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
'@

# ============================================================
# FILE: users/users.module.ts
# ============================================================
Set-Content "$base\users\users.module.ts" @'
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
'@

# ============================================================
# FILE: users/users.service.ts
# ============================================================
Set-Content "$base\users\users.service.ts" @'
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: { isActive: true },
      include: { department: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { department: true, locations: true },
    });
  }
}
'@

# ============================================================
# FILE: users/users.controller.ts
# ============================================================
Set-Content "$base\users\users.controller.ts" @'
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
'@

# ============================================================
# FILE: bookings/bookings.module.ts
# ============================================================
Set-Content "$base\bookings\bookings.module.ts" @'
import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
'@

# ============================================================
# FILE: bookings/bookings.service.ts
# ============================================================
Set-Content "$base\bookings\bookings.service.ts" @'
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.booking.findMany({
      include: {
        room: true,
        createdBy: true,
        department: true,
        approver: true,
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        room: { include: { location: true } },
        createdBy: true,
        department: true,
        approver: true,
      },
    });
  }
}
'@

# ============================================================
# FILE: bookings/bookings.controller.ts
# ============================================================
Set-Content "$base\bookings\bookings.controller.ts" @'
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }
}
'@

# ============================================================
# FILE: rooms/rooms.module.ts
# ============================================================
Set-Content "$base\rooms\rooms.module.ts" @'
import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}
'@

# ============================================================
# FILE: rooms/rooms.service.ts
# ============================================================
Set-Content "$base\rooms\rooms.service.ts" @'
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.room.findMany({
      where: { isActive: true },
      include: { location: true },
      orderBy: { roomName: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.room.findUnique({
      where: { id },
      include: { location: true },
    });
  }
}
'@

# ============================================================
# FILE: rooms/rooms.controller.ts
# ============================================================
Set-Content "$base\rooms\rooms.controller.ts" @'
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }
}
'@

# ============================================================
# FILE: site-visits/site-visits.module.ts
# ============================================================
Set-Content "$base\site-visits\site-visits.module.ts" @'
import { Module } from '@nestjs/common';
import { SiteVisitsService } from './site-visits.service';
import { SiteVisitsController } from './site-visits.controller';

@Module({
  controllers: [SiteVisitsController],
  providers: [SiteVisitsService],
})
export class SiteVisitsModule {}
'@

# ============================================================
# FILE: site-visits/site-visits.service.ts
# ============================================================
Set-Content "$base\site-visits\site-visits.service.ts" @'
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SiteVisitsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.siteVisit.findMany({
      include: { client: true, site: true, bookedBy: true },
      orderBy: { visitDate: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.siteVisit.findUnique({
      where: { id },
      include: { client: true, site: true, bookedBy: true },
    });
  }
}
'@

# ============================================================
# FILE: site-visits/site-visits.controller.ts
# ============================================================
Set-Content "$base\site-visits\site-visits.controller.ts" @'
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SiteVisitsService } from './site-visits.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('site-visits')
@UseGuards(JwtAuthGuard)
export class SiteVisitsController {
  constructor(private readonly siteVisitsService: SiteVisitsService) {}

  @Get()
  findAll() {
    return this.siteVisitsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.siteVisitsService.findOne(id);
  }
}
'@

Write-Host "✅ All 25 source files created"

# ============================================================
# apps/backend/package.json
# ============================================================
Set-Content "apps\backend\package.json" @'
{
  "name": "backend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@prisma/client": "^5.22.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "bcrypt": "^5.1.1",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/node": "^20.3.1",
    "@types/passport-jwt": "^4.0.0",
    "@types/bcrypt": "^5.0.2",
    "prisma": "^5.22.0",
    "ts-node": "^10.9.1",
    "typescript": "^5.1.3"
  }
}
'@

# ============================================================
# apps/backend/tsconfig.json
# ============================================================
Set-Content "apps\backend\tsconfig.json" @'
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
'@

# ============================================================
# apps/backend/nest-cli.json
# ============================================================
Set-Content "apps\backend\nest-cli.json" @'
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
'@

# ============================================================
# apps/backend/.env (copy from root .env)
# ============================================================
Copy-Item ".env" "apps\backend\.env" -Force

Write-Host "✅ Config files created"
Write-Host ""
Write-Host "🚀 Now run:"
Write-Host "   cd apps\backend"
Write-Host "   npm install"
Write-Host "   npm run build"
