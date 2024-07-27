import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment';
import { TabPosTransaksi } from 'src/entities/transaksi';
import { TabPosTransaksiDetail } from 'src/entities/transaksi_detail';
import { TabPosBarang } from 'src/entities/barang';
import { TabPosUser } from 'src/entities/user';
import { TabHistoryBarang } from 'src/entities/history_barang';

@Injectable()
export class TransaksiService {
    constructor(
        @InjectRepository(TabPosTransaksi)
        private transaksiRepository: Repository<TabPosTransaksi>,
        @InjectRepository(TabPosTransaksiDetail)
        private transaksiDetailRepository: Repository<TabPosTransaksiDetail>,
        @InjectRepository(TabPosBarang)
        private barangRepository: Repository<TabPosBarang>,
        @InjectRepository(TabPosUser)
        private userRepository: Repository<TabPosUser>,
        @InjectRepository(TabHistoryBarang)
        private historyBarangRepository: Repository<TabHistoryBarang>,
    ) { }

    async processTransaction(id_user: string, items: { id_barang: string; qty: number }[]): Promise<any> {
        try {
            const user = await this.userRepository.findOne({ where: { id_user } });

            if (!user) {
                return { message: 'User not found', statusCode: HttpStatus.NOT_FOUND };
            }

            let totalAmount = 0;
            const transactionDetails = [];
            const historyDetails = [];

            for (const item of items) {
                const { id_barang, qty } = item;
                const barang = await this.barangRepository.findOne({ where: { id_barang } });

                if (!barang) {
                    return { message: `Barang with id ${id_barang} not found`, statusCode: HttpStatus.NOT_FOUND };
                }

                if (barang.qty < qty) {
                    return { message: `Insufficient quantity for barang with id ${id_barang}`, statusCode: HttpStatus.BAD_REQUEST };
                }

                const amount = (barang.amount + barang.amount_default) * qty;
                totalAmount += amount;

                barang.qty -= qty;

                const transactionDetail = this.transaksiDetailRepository.create({
                    id_barang: barang,
                    amount,
                    qty,
                });

                transactionDetails.push(transactionDetail);

                const historyDetail = this.historyBarangRepository.create({
                    id_user: user,
                    id_barang: barang,
                    qty,
                    keterangan: 'SOLD',
                    tanggal_updated: moment().valueOf().toString(),
                });

                historyDetails.push(historyDetail);

                await this.barangRepository.save(barang);
            }

            const timestamp = moment().valueOf().toString();

            const newTransaction = this.transaksiRepository.create({
                id_user: user,
                total_amount: totalAmount,
                status_transaksi: 'PAID',
                tanggal_transaksi: timestamp,
            });

            const savedTransaction = await this.transaksiRepository.save(newTransaction);

            for (const detail of transactionDetails) {
                detail.id_transaksi = savedTransaction;
                await this.transaksiDetailRepository.save(detail);
            }

            for (const history of historyDetails) {
                await this.historyBarangRepository.save(history);
            }

            return { message: 'Transaction successful', statusCode: HttpStatus.CREATED };
        } catch (err) {
            console.error('Error in processTransaction:', err.message);
            return { message: err.message, statusCode: HttpStatus.INTERNAL_SERVER_ERROR };
        }
    }

    async getTransaksiByOfficer(id_user: string): Promise<any> {
        try {
            const transaksi = await this.transaksiRepository.createQueryBuilder('transaksi')
                .leftJoinAndSelect('transaksi.id_user', 'user')
                .leftJoinAndSelect('transaksi.details', 'details')
                .leftJoinAndSelect('details.id_barang', 'barang')
                .where('user.id_user = :id_user', { id_user })
                .getMany();

            const transaksiData = transaksi.map(item => ({
                id_transaksi: item.id_transaksi,
                nama_user: item.id_user.nama,
                nomor_telepon_user: item.id_user.nomor_telepon,
                details: item.details.map(detail => ({
                    id_barang: detail.id_barang.id_barang,
                    nama: detail.id_barang.nama,
                    qty: detail.qty,
                    amount: this.formatToIDR(detail.amount)
                })),
                total_amount: this.formatToIDR(item.details.reduce((sum, detail) => sum + (detail.qty * (detail.id_barang.amount + detail.id_barang.amount_default)), 0)),
                status_transaksi: item.status_transaksi,
                tanggal_transaksi: moment.tz(parseInt(item.tanggal_transaksi), 'Asia/Jakarta').format("DD MMM YYYY hh:MM z")
            }));

            return { data: transaksiData, statusCode: 200 };
        } catch (err) {
            console.error('Error retrieving transaction data:', err);
            return { message: err.message, statusCode: 500 };
        }
    }
    async getAllTransaksi(): Promise<any> {
        try {
            const transaksi = await this.transaksiRepository.createQueryBuilder('transaksi')
                .leftJoinAndSelect('transaksi.id_user', 'user')
                .leftJoinAndSelect('transaksi.details', 'details')
                .leftJoinAndSelect('details.id_barang', 'barang')
                .getMany();

            const transaksiData = transaksi.map(item => ({
                id_transaksi: item.id_transaksi,
                nama_user: item.id_user.nama,
                nomor_telepon_user: item.id_user.nomor_telepon,
                details: item.details.map(detail => ({
                    id_barang: detail.id_barang.id_barang,
                    nama: detail.id_barang.nama,
                    qty: detail.qty,
                    amount: this.formatToIDR(detail.amount)
                })),
                total_amount: this.formatToIDR(item.details.reduce((sum, detail) => sum + (detail.qty * (detail.id_barang.amount + detail.id_barang.amount_default)), 0)),
                status_transaksi: item.status_transaksi,
                tanggal_transaksi: item.tanggal_transaksi
            }));

            return { data: transaksiData, statusCode: 200 };
        } catch (err) {
            console.error('Error retrieving all transactions:', err);
            return { message: err.message, statusCode: 500 };
        }
    }

    async getTransaksiDataById(id_transaksi: string): Promise<any> {
        try {
            const transaksi = await this.transaksiRepository.createQueryBuilder('transaksi')
                .leftJoinAndSelect('transaksi.id_user', 'user')
                .leftJoinAndSelect('transaksi.details', 'details')
                .leftJoinAndSelect('details.id_barang', 'barang')
                .where('transaksi.id_transaksi = :id_transaksi', { id_transaksi })
                .getOne();

            if (!transaksi) {
                return { message: 'Transaction not found', statusCode: 404 };
            }

            const transaksiData = {
                id_transaksi: transaksi.id_transaksi,
                nama_user: transaksi.id_user.nama,
                nomor_telepon_user: transaksi.id_user.nomor_telepon,
                details: transaksi.details.map(detail => ({
                    id_barang: detail.id_barang.id_barang,
                    nama: detail.id_barang.nama,
                    qty: detail.qty,
                    amount: this.formatToIDR(detail.amount)
                })),
                total_amount: this.formatToIDR(transaksi.details.reduce((sum, detail) => sum + (detail.qty * (detail.id_barang.amount + detail.id_barang.amount_default)), 0)),
                status_transaksi: transaksi.status_transaksi,
                tanggal_transaksi: moment.tz(parseInt(transaksi.tanggal_transaksi), 'Asia/Jakarta').format("DD MMM YYYY hh:mm z")
            };

            return { data: transaksiData, statusCode: 200 };
        } catch (err) {
            console.error('Error retrieving transaction data:', err);
            return { message: err.message, statusCode: 500 };
        }
    }

    formatToIDR(value: number): string {
        return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
    }

}
