import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TabPosBarang } from 'src/entities/barang';
import { TabPosKategoriBarang } from 'src/entities/kategori';
import * as moment from "moment-timezone";

@Injectable()
export class BarangService {
    constructor(
        @InjectRepository(TabPosBarang)
        private readonly barangRepository: Repository<TabPosBarang>,
        @InjectRepository(TabPosKategoriBarang)
        private readonly kategoriRepository: Repository<TabPosKategoriBarang>,
    ) { }

    async create(createBarangDto: TabPosBarang): Promise<any> {
        const {added_at, ...restParams} = createBarangDto

        const timestamp = moment().valueOf().toString()
        const newBarang = this.barangRepository.create({
            added_at: timestamp,
            ...restParams,
        });
        return await this.barangRepository.save(newBarang);
    }

    async findAll(): Promise<any> {
        const data = await this.barangRepository.find({ relations: ['kategori_id'] });

        const count = data.length

        const mapdata = data.map(item=>({
            id_barang: item.id_barang,
            nama: item.nama,
            qty: item.qty,
            amount: item.amount,
            last_added_at: moment.tz(parseInt(item.added_at), 'Asia/Jakarta').format("DD MMMM YYY hh:mm z"),
            kategori_barang: item.kategori_id.nama,
        }))

        return {data: mapdata, total: count, statusCode: HttpStatus.OK}
    }

    async findOne(id: string): Promise<any> {
        const barang = await this.barangRepository.findOne({ where: { id_barang: id }, relations: ['kategori_id'] });
        if (!barang) {
            throw new NotFoundException(`Barang with ID ${id} not found`);
        }
        return {data: barang, statusCode: HttpStatus.OK};
    }

    async update(id: string, updateBarangDto: TabPosBarang): Promise<any> {
        await this.barangRepository.update(id, updateBarangDto);
        const updatedBarang = await this.barangRepository.findOne({ where: { id_barang: id }, relations: ['kategori_id'] });
        if (!updatedBarang) {
            throw new NotFoundException(`Barang with ID ${id} not found`);
        }
        return {data: updatedBarang, statusCode: HttpStatus.OK};
    }

    async remove(id: string): Promise<any> {
        const result = await this.barangRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Barang with ID ${id} not found`);
        }

        return {message: 'success', statusCode: HttpStatus.OK}
    }

    async findAllKategori(): Promise<any> {
        const data = await this.kategoriRepository.find();

        const count = data.length

        return {data: data, total: count, statusCode: HttpStatus.OK}
    }

    async createKategori(createBarangDto: TabPosKategoriBarang): Promise<any> {
        const newBarang = this.kategoriRepository.create(createBarangDto);
        return await this.kategoriRepository.save(newBarang);
    }

    async findOneKategori(id: string): Promise<any> {
        const barang = await this.kategoriRepository.findOne({where: { id_kategori_barang: id}})
        if (!barang) {
            throw new NotFoundException(`Barang with ID ${id} not found`);
        }
        return {data: barang, statusCode: HttpStatus.OK};
    }

    async updateKategori(id: string, updateBarangDto: TabPosKategoriBarang): Promise<any> {
        await this.barangRepository.update(id, updateBarangDto);
        const updatedBarang = await this.kategoriRepository.findOne({ where: { id_kategori_barang: id }});
        if (!updatedBarang) {
            throw new NotFoundException(`Barang with ID ${id} not found`);
        }
        return {data: updatedBarang, statusCode: HttpStatus.OK};
    }

    async removeKategori(id: string): Promise<any> {
        const result = await this.kategoriRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Barang with ID ${id} not found`);
        }

        return {message: 'success', statusCode: HttpStatus.OK}
    }
}
