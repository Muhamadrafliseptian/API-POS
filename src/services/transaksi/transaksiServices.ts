import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import * as moment from 'moment';
import { TabPosTransaksi } from 'src/entities/transaksi';
import { TabPosTransaksiDetail } from 'src/entities/transaksi_detail';
import { TabPosBarang } from 'src/entities/barang';
import { TabPosUser } from 'src/entities/user';
import { TabHistoryBarang } from 'src/entities/history_barang';
import { TabScheduleShift } from 'src/entities/schedule_shift';

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
        @InjectRepository(TabScheduleShift)
        private scheduleshiftRepository: Repository<TabScheduleShift>,
    ) { }

    async processTransaction(id_user: string, in_amount: number, nama_shift: string,items: { id_barang: string; qty: number }[]): Promise<any> {
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

            const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    const currentTime = moment();

    let nama_shift = '';
    if (currentTime.isBetween(moment('06:00:00', 'HH:mm:ss'), moment('12:00:00', 'HH:mm:ss'))) {
      nama_shift = 'PAGI';
    } else if (currentTime.isBetween(moment('12:00:00', 'HH:mm:ss'), moment('17:59:00', 'HH:mm:ss'))) {
      nama_shift = 'SIANG';
    } else if (currentTime.isBetween(moment('18:00:00', 'HH:mm:ss'), moment('23:59:00', 'HH:mm:ss'))) {
        nama_shift = 'SORE';
    } else if (currentTime.isBetween(moment('00:00:00', 'HH:mm:ss'), moment('05:59', 'HH:mm'))) {
        nama_shift = 'MALAM'
    } else {
        nama_shift = "OTHER"
    }

            if(in_amount < totalAmount){
                return {message: 'your money doesnt enough to pay this', statusCode: HttpStatus.BAD_REQUEST}
            }

            const newTransaction = this.transaksiRepository.create({
                id_user: user,
                in_amount: in_amount,
                return_amount: in_amount - totalAmount,
                total_amount: totalAmount,
                status_transaksi: 'PAID',
                tanggal_transaksi: timestamp,
                nama_shift: nama_shift,
            });

            console.log(newTransaction);
            

            const savedTransaction = await this.transaksiRepository.save(newTransaction);

            for (const detail of transactionDetails) {
                detail.id_transaksi = savedTransaction;
                await this.transaksiDetailRepository.save(detail);
            }

            for (const history of historyDetails) {
                await this.historyBarangRepository.save(history);
            }

            return { message: 'Transaction successful', id_transaksi: newTransaction.id_transaksi,statusCode: HttpStatus.CREATED };
        } catch (err) {
            console.error('Error in processTransaction:', err.message);
            return { message: err.message, statusCode: HttpStatus.INTERNAL_SERVER_ERROR };
        }
    }

    async countTodayPaidTransactions(): Promise<any> {
        try {
          const startOfToday = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
          const endOfToday = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    
          const paidTransactionCount = await this.transaksiRepository.count({
            where: {
              status_transaksi: 'PAID',
              tanggal_transaksi: Between(startOfToday, endOfToday),
            },
          });
    
          return { count: paidTransactionCount, statusCode: HttpStatus.OK };
        } catch (err) {
          console.error('Error in countTodayPaidTransactions:', err.message);
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
                    amount: detail.amount
                })),
                total_amount: item.details.reduce((sum, detail) => sum + (detail.qty * (detail.id_barang.amount + detail.id_barang.amount_default)), 0),
                status_transaksi: item.status_transaksi,
                tanggal_transaksi: item.tanggal_transaksi+moment.tz(item.tanggal_transaksi, 'Asia/Jakarta').format(" A z")
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
                    amount: detail.amount
                })),
                in_amount: item.in_amount,
                return_amount: item.return_amount,
                total_amount: item.details.reduce((sum, detail) => sum + (detail.qty * (detail.id_barang.amount + detail.id_barang.amount_default)), 0),
                status_transaksi: item.status_transaksi,
                tanggal_transaksi: item.tanggal_transaksi+moment.tz(item.tanggal_transaksi, 'Asia/Jakarta').format(" A z")
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
                    amount: detail.amount
                })),
                nama_shift: transaksi.nama_shift || "",
                in_amount: transaksi.in_amount,
                return_amount: transaksi.return_amount,
                total_amount: transaksi.details.reduce((sum, detail) => sum + (detail.qty * (detail.id_barang.amount + detail.id_barang.amount_default)), 0),
                status_transaksi: transaksi.status_transaksi,
                tanggal_transaksi: transaksi.tanggal_transaksi+moment.tz(transaksi.tanggal_transaksi, 'Asia/Jakarta').format(" A z")
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
