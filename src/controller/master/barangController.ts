import { Controller, Post, Body, Param, Delete } from '@nestjs/common';
import { BarangService } from 'src/services/master/barangServices';
import { TabPosBarang } from 'src/entities/barang';
import { TabPosKategoriBarang } from 'src/entities/kategori';

@Controller('api/master')
export class BarangController {
    constructor(private readonly barangService: BarangService) { }

    @Post('barang/create')
    async create(@Body() TabPosBarang: TabPosBarang) {
        try {
            const response = await this.barangService.create(TabPosBarang);
            return response
        } catch (err) {
            return err
        }
    }

    @Post('barang/all')
    async findAll() {
        try {
            const response = await this.barangService.findAll();
            return response
        } catch (err) {
            return err
        }
    }

    @Post('barang/:id/detail')
    async findOne(@Param('id') id: string) {
        try {
            const response = await this.barangService.findOne(id);
            return response
        } catch (err) {
            return err
        }
    }

    @Post('barang/:id/update')
    async update(@Param('id') id: string, @Body() updateBarangDto: TabPosBarang) {
        try {
            const response = await this.barangService.update(id, updateBarangDto);
            return response
        } catch (err) {
            return err
        }
    }

    @Delete('barang/:id/delete')
    async remove(@Param('id') id: string) {
        try {
            const response = await this.barangService.remove(id);
            return response
        } catch (err) {
            return err
        }
    }

    @Post('barang/:id_barang/in')
    async inBarang(@Param('id_barang') id_barang: string, @Body() params: any) {
        try {
            const response = await this.barangService.inBarang(id_barang, params);
            return response
        } catch (err) {
            return err
        }
    }

    @Post('barang/:id_barang/out')
    async outBarang(@Param('id_barang') id_barang: string, @Body() params: any) {
        try {
            const response = await this.barangService.outBarang(id_barang, params);
            return response
        } catch (err) {
            return err
        }
    }

    @Post('barang/history')
    async historyBarang() {
        try {
            const response = await this.barangService.historyBarang();
            return response
        } catch (err) {
            return err
        }
    }


    @Post('kategori/create')
    async createKategori(@Body() params: TabPosKategoriBarang) {
        try {
            const response = await this.barangService.createKategori(params);
            return response
        } catch (err) {
            return err
        }
    }

    @Post('kategori/all')
    async findAllKategori() {
        try {
            const response = await this.barangService.findAllKategori();
            return response
        } catch (err) {
            return err
        }
    }

    @Post('kategori/:id/detail')
    async findOneKategori(@Param('id') id: string) {
        try {
            const response = await this.barangService.findOneKategori(id);
            return response
        } catch (err) {
            return err
        }
    }

    @Post('kategori/:id/update')
    async updateKategori(@Param('id') id: string, @Body() updateBarangDto: TabPosKategoriBarang) {
        try {
            const response = await this.barangService.updateKategori(id, updateBarangDto);
            return response
        } catch (err) {
            return err
        }
    }

    @Delete('kategori/:id/delete')
    async removeKategori(@Param('id') id: string) {
        try {
            const response = await this.barangService.removeKategori(id);
            return response
        } catch (err) {
            return err
        }
    }
}
