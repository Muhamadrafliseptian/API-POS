import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TabPosBarang } from 'src/entities/barang';
import { BarangService } from 'src/services/master/barangServices';
import { BarangController } from 'src/controller/master/barangController';
import { TabPosKategoriBarang } from 'src/entities/kategori';
import { TabPosTransaksi } from 'src/entities/transaksi';
import { TabPosUser } from 'src/entities/user';
import { TransaksiServices } from 'src/services/transaksi/transaksiServices';
import { TransaksiController } from 'src/controller/transaksi/transaksiController';

@Module({
  imports: [
    TypeOrmModule.forFeature([TabPosBarang, TabPosKategoriBarang, TabPosTransaksi, TabPosUser]),
  ],
  providers: [BarangService, TransaksiServices],
  controllers: [BarangController, TransaksiController],
})
export class MainModule {}
