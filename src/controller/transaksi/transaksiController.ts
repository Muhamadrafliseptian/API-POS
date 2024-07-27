import { Controller, Post, Body, HttpStatus, Param } from '@nestjs/common';
import { TransaksiService } from 'src/services/transaksi/transaksiServices';
import { ProcessTransactionDto } from './transaksiDto';

@Controller('api/transaksi')
export class TransaksiController {
    constructor(private readonly transaksiService: TransaksiService) { }

    @Post('all')
    async getAllTransaksi() {
        return this.transaksiService.getAllTransaksi();
    }

    @Post('checkout')
    async processTransaction(@Body() body: ProcessTransactionDto): Promise<any> {
        const { id_user, in_amount, nama_shift,items } = body;
        const result = await this.transaksiService.processTransaction(id_user, in_amount, nama_shift,items);
        return result;
    }

    @Post(':id_user/detail_transaksi/officer')
    async getTransaksi(@Param('id_user') id_user: string): Promise<any> {
        return this.transaksiService.getTransaksiByOfficer(id_user);
    }

    @Post(':id_transaksi/detail_transaksi')
    async getTransaksiDataById(@Param('id_transaksi') id_transaksi: string): Promise<any> {
        return this.transaksiService.getTransaksiDataById(id_transaksi);
    }
}

