import { Controller, Get, Param, Post } from "@nestjs/common";
import { TransaksiServices } from "src/services/transaksi/transaksiServices";

@Controller('api/transaksi')

export class TransaksiController{
    constructor(
        private transaksiService: TransaksiServices
    ){}

    async getTransaksi():Promise<any>{
        try {
            const response = await this.transaksiService.getTransaksi()
            return response
        } catch (err){

        }
    }
    
    @Post(':id_transaksi/detail')
    async getDetailTransaksi(@Param('id_transaksi') id_transaksi: string) :Promise<any>{
        try {

        } catch (err){
            
        }
    }
}