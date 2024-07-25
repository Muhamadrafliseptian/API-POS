import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TabPosBarang } from 'src/entities/barang';
import { BarangService } from 'src/services/master/barangServices';
import { BarangController } from 'src/controller/master/barangController';
import { TabPosKategoriBarang } from 'src/entities/kategori';

@Module({
  imports: [
    TypeOrmModule.forFeature([TabPosBarang, TabPosKategoriBarang]),
  ],
  providers: [BarangService],
  controllers: [BarangController],
})
export class MainModule {}
