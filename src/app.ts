import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MainConfigModule } from './config/config';
import { TabPosRole } from './entities/role';
import { TabPosBarang } from './entities/barang';
import { TabPosKategoriBarang } from './entities/kategori';
import { TabPosUser } from './entities/user';
import { AuthModule } from './module/auth/authModule';
import { MainModule } from './module/main/mainModule';
import { TabPosTransaksi } from './entities/transaksi';
import { TabHistoryBarang } from './entities/history_barang';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [MainConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>(
          'DB_NAME',
          'db_pos',
        ),
        entities: [
          TabPosRole,
          TabPosBarang,
          TabPosKategoriBarang,
          TabPosUser,
          TabPosTransaksi,
          TabHistoryBarang
        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    AuthModule,
    MainModule
  ],
  providers: [],
})
export class AppModule { }