import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TabPosBarang } from "src/entities/barang";
import { TabPosKategoriBarang } from "src/entities/kategori";
import { TabScheduleShift } from "src/entities/schedule_shift";
import { TabPosTransaksi } from "src/entities/transaksi";
import { TabPosUser } from "src/entities/user";
import { Between, Repository } from "typeorm";
import * as moment from 'moment-timezone';

@Injectable()
export class DashboardServices {
  constructor(
    @InjectRepository(TabPosUser)
    private userRepository: Repository<TabPosUser>,
    @InjectRepository(TabPosBarang)
    private barangRepository: Repository<TabPosBarang>,
    @InjectRepository(TabPosTransaksi)
    private transaksiRepository: Repository<TabPosTransaksi>,
    @InjectRepository(TabPosKategoriBarang)
    private kategoriRepository: Repository<TabPosKategoriBarang>,
    @InjectRepository(TabScheduleShift)
    private scheduleRepository: Repository<TabScheduleShift>
  ){}  

  async getCountData():Promise<any>{
    try {
        const countOfficer = await this.userRepository.count({where: {role_id: {nama: 'officer'}}, relations: ['role_id']})
        const countOwner = await this.userRepository.count({where: {role_id: {nama: 'owner'}}, relations: ['role_id']})
        const countBarang = await this.barangRepository.count({relations: ['kategori_id']})
        const countTransaksi = await this.transaksiRepository.count({where: {status_transaksi: 'PAID'}})
        const countKategori = await this.kategoriRepository.count()
        const countQtyNull = await this.barangRepository.count({where: {qty: 0}})

        const startOfToday = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
      const endOfToday = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');

      const paidTransactionCount = await this.transaksiRepository.find({
        where: {
          status_transaksi: 'PAID',
          tanggal_transaksi: Between(startOfToday, endOfToday),

        },
      });



      const totalAmount = paidTransactionCount.reduce((sum, item) => sum + item.total_amount, 0);

      console.log(totalAmount);
      
        return {data: {
            total_officer: countOfficer,
            total_owner: countOwner,
            total_barang: countBarang,
            total_kategori: countKategori,
            total_transaksi: countTransaksi,
            total_out_off_stock: countQtyNull,
            total_transaksi_paid: totalAmount
        }, statusCode: HttpStatus.OK}
    } catch (err){
        console.log(err.message);
        
    }
  }

  async getScheduleShift(): Promise<any> {
    try {
      const response = await this.scheduleRepository.find();

      const mapResponse = response.map(item => ({
        id_shift: item.id_schedule_shift,
        nama: item.nama,
        start_time: moment(item.start_time).format('HH:mm'),
        end_time: moment(item.end_time).format('HH:mm')
      }));

      return { data: mapResponse };
    } catch (err) {
      console.error(err);
      return { data: [] };
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
  
  
}