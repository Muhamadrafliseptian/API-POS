import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TabPosUser } from "./user";
import { TabPosBarang } from "./barang";

@Entity('tab_pos_transaksi')
export class TabPosTransaksi {
    @PrimaryGeneratedColumn()
    id_transaksi: string

    @ManyToOne(()=>TabPosUser)
    @JoinColumn({name: 'id_user'})
    id_user: TabPosUser

    @ManyToOne(()=>TabPosBarang)
    @JoinColumn({name: 'id_barang'})
    id_barang: TabPosBarang

    @Column(('double'),{nullable: true})
    amount: number

    @Column({nullable: true})
    qty: number

    @Column({nullable: true})
    status_transaksi: string

    @Column({nullable: true})
    tanggal_transaksi: string

}