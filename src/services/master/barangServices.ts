import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TabPosBarang } from 'src/entities/barang';
import { TabPosKategoriBarang } from 'src/entities/kategori';
import * as moment from "moment-timezone";
import { TabHistoryBarang } from 'src/entities/history_barang';

@Injectable()
export class BarangService {
    constructor(
        @InjectRepository(TabPosBarang)
        private readonly barangRepository: Repository<TabPosBarang>,
        @InjectRepository(TabPosKategoriBarang)
        private readonly kategoriRepository: Repository<TabPosKategoriBarang>,
        @InjectRepository(TabHistoryBarang)
        private readonly historyQtyRepository: Repository<TabHistoryBarang>,
    ) { }

    async create(createBarangDto: TabPosBarang): Promise<any> {
        const { added_at, ...restParams } = createBarangDto

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

        const mapdata = data.map(item => ({
            id_barang: item.id_barang,
            nama: item.nama,
            qty: item.qty,
            amount: item.amount,
            last_added_at: moment.tz(parseInt(item.added_at), 'Asia/Jakarta').format("DD MMMM YYY hh:mm z"),
            kategori_barang: item.kategori_id.nama,
        }))

        return { data: mapdata, total: count, statusCode: HttpStatus.OK }
    }

    async findOne(id: string): Promise<any> {
        const barang = await this.barangRepository.findOne({ where: { id_barang: id }, relations: ['kategori_id'] });
        if (!barang) {
            throw new NotFoundException(`Barang with ID ${id} not found`);
        }
        return { data: barang, statusCode: HttpStatus.OK };
    }

    async update(id: string, updateBarangDto: TabPosBarang): Promise<any> {
        await this.barangRepository.update(id, updateBarangDto);
        const updatedBarang = await this.barangRepository.findOne({ where: { id_barang: id }, relations: ['kategori_id'] });
        if (!updatedBarang) {
            throw new NotFoundException(`Barang with ID ${id} not found`);
        }
        return { data: updatedBarang, statusCode: HttpStatus.OK };
    }

    async remove(id: string): Promise<any> {
        const result = await this.barangRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Barang with ID ${id} not found`);
        }

        return { message: 'success', statusCode: HttpStatus.OK }
    }

    async findAllKategori(): Promise<any> {
        const data = await this.kategoriRepository.find();

        const count = data.length

        return { data: data, total: count, statusCode: HttpStatus.OK }
    }

    async createKategori(createBarangDto: TabPosKategoriBarang): Promise<any> {
        const newBarang = this.kategoriRepository.create(createBarangDto);
        return await this.kategoriRepository.save(newBarang);
    }

    async findOneKategori(id: string): Promise<any> {
        const barang = await this.kategoriRepository.findOne({ where: { id_kategori_barang: id } })
        if (!barang) {
            throw new NotFoundException(`Barang with ID ${id} not found`);
        }
        return { data: barang, statusCode: HttpStatus.OK };
    }

    async updateKategori(id: string, updateBarangDto: TabPosKategoriBarang): Promise<any> {
        await this.barangRepository.update(id, updateBarangDto);
        const updatedBarang = await this.kategoriRepository.findOne({ where: { id_kategori_barang: id } });
        if (!updatedBarang) {
            throw new NotFoundException(`Barang with ID ${id} not found`);
        }
        return { data: updatedBarang, statusCode: HttpStatus.OK };
    }

    async removeKategori(id: string): Promise<any> {
        const result = await this.kategoriRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Barang with ID ${id} not found`);
        }

        return { message: 'success', statusCode: HttpStatus.OK }
    }

    async inBarang(id_barang: string, params: any): Promise<any> {
        try {
            const { qty, id_user } = params
            const findBarang = await this.barangRepository.findOne({ where: { id_barang: id_barang }, relations: ['kategori_id'] })
            const timestamp = moment().valueOf().toString()
            if (!findBarang) {
                return
            }
            const createHistory = await this.historyQtyRepository.create({
                id_user: { id_user: id_user },
                id_barang: { id_barang: findBarang.id_barang },
                keterangan: "IN",
                tanggal_updated: timestamp
            })

            console.log('====================================');
            console.log(createHistory);
            console.log('====================================');
            findBarang.qty += qty
            const saveBarang = await this.barangRepository.save(findBarang)
            const saveHistory = await this.historyQtyRepository.save(createHistory)

            return { message: "success", statuCode: HttpStatus.CREATED }

        } catch (err) {
            console.log('====================================');
            console.log(err);
            console.log('====================================');
        }
    }

    async outBarang(id_barang: string, params: any): Promise<any> {
        try {
            const { qty, id_user } = params
            const findBarang = await this.barangRepository.findOne({ where: { id_barang: id_barang }, relations: ['kategori_id'] })
            const timestamp = moment().valueOf().toString()
            if (!findBarang) {
                return
            }
            if (findBarang.qty === 0) {
                return { message: 'jumlah barang 0', statusCode: HttpStatus.BAD_REQUEST }
            }
            if (qty > findBarang.qty) {
                return { message: 'Qty yang diminta melebihi qty saat ini', statusCode: HttpStatus.BAD_REQUEST };
            }
            const createHistory = await this.historyQtyRepository.create({
                id_user: { id_user: id_user },
                id_barang: { id_barang: findBarang.id_barang },
                keterangan: "OUT",
                tanggal_updated: timestamp
            })
            findBarang.qty -= qty
            const saveBarang = await this.barangRepository.save(findBarang)
            const saveHistory = await this.historyQtyRepository.save(createHistory)

            return { message: "success", statuCode: HttpStatus.CREATED }

        } catch (err) {

        }
    }
}
