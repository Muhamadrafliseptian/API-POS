import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TabPosBarang } from 'src/entities/barang';
import { BarangService } from 'src/services/master/barangServices';
import { BarangController } from 'src/controller/master/barangController';
import { TabPosKategoriBarang } from 'src/entities/kategori';
import { TabPosTransaksi } from 'src/entities/transaksi';
import { TabPosUser } from 'src/entities/user';
import { TransaksiService } from 'src/services/transaksi/transaksiServices';
import { TransaksiController } from 'src/controller/transaksi/transaksiController';
import { TabHistoryBarang } from 'src/entities/history_barang';
import { TabPosTransaksiDetail } from 'src/entities/transaksi_detail';
import { DashboardServices } from 'src/services/master/dashboardServices';
import { DashboardController } from 'src/controller/master/dashboardController';
import { TabScheduleShift } from 'src/entities/schedule_shift';

@Module({
  imports: [
    TypeOrmModule.forFeature([TabPosBarang, TabPosTransaksiDetail,TabPosKategoriBarang, TabPosTransaksi, TabPosUser, TabHistoryBarang, TabScheduleShift]),
  ],
  providers: [BarangService, TransaksiService, DashboardServices],
  controllers: [BarangController, TransaksiController, DashboardController],
})
export class MainModule {}
