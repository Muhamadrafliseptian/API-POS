import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from 'src/controller/Auth/AuthController';
import { JwtStrategy } from 'src/services/Auth/JwtStrategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TabPosUser } from 'src/entities/user';
import { TabPosRole } from 'src/entities/role';
import { AuthService } from 'src/services/Auth/AuthServices';

@Module({
  imports: [
    TypeOrmModule.forFeature([TabPosUser, TabPosRole]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_KEY'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
