import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TabPosTransaksi } from "src/entities/transaksi";
import { Repository } from "typeorm";

@Injectable()
export class TransaksiServices {
    constructor(
        @InjectRepository(TabPosTransaksi)
        private transaksiRepository: Repository<TabPosTransaksi>
    ) { }

    async getTransaksi(): Promise<any> {
        try {
            const response = await this.transaksiRepository.find({
                where: { status_transaksi: "PAID" },
                relations: ['id_user', 'id_barang']
            })

            const mapTransaksi = response.map(item => ({
                id_transaksi: item.id_transaksi,
                data_pembeli: {
                    nama_pembeli: item.id_user.nama,
                    nomor_telepon_pembeli: item.id_user.nomor_telepon,
                },
                data_checkout: {
                    nama_barang: item.id_barang.nama,
                    qty: item.qty,
                },
                status_transaksi: item.status_transaksi,
                total_harga: item.amount,
                tanggal_transaksi: item.tanggal_transaksi,
            }))

            return { data: mapTransaksi, total: mapTransaksi.length, statusCode: HttpStatus.OK }
        } catch (err) {

        }
    }

    async getDetailTransaksi(id_transaksi: string): Promise<any> {
        try {
            const response = await this.transaksiRepository.findOne({
                where: {
                    id_transaksi: id_transaksi
                },
                relations: ['id_barang', 'id_user']
            })

            if(!response){
                return {message: 'not found', statusCode: HttpStatus.NOT_FOUND}
            }

            const mapTransaksi = {
                id_transaksi: response.id_transaksi,
                data_pembeli: {
                    nama_pembeli: response.id_user.nama,
                    nomor_telepon_pembeli: response.id_user.nomor_telepon,
                },
                data_checkout: {
                    nama_barang: response.id_barang.nama,
                    qty: response.qty,
                },
                status_transaksi: response.status_transaksi,
                total_harga: response.amount,
                tanggal_transaksi: response.tanggal_transaksi,
            }

            return { data: mapTransaksi, statusCode: HttpStatus.OK }
        } catch (err) {

        }
    }
}