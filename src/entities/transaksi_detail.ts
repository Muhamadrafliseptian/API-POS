import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TabPosTransaksi } from "./transaksi";
import { TabPosBarang } from "./barang";

@Entity('tab_pos_transaksi_detail')
export class TabPosTransaksiDetail {
    @PrimaryGeneratedColumn()
    id_transaksi_detail: string;

    @ManyToOne(() => TabPosTransaksi, transaksi => transaksi.details)
    @JoinColumn({ name: 'id_transaksi' })
    id_transaksi: TabPosTransaksi;

    @ManyToOne(() => TabPosBarang)
    @JoinColumn({ name: 'id_barang' })
    id_barang: TabPosBarang;

    @Column('double', { nullable: true })
    amount: number;

    @Column({ nullable: true })
    qty: number;
}
