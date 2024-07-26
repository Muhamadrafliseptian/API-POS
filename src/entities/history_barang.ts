import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TabPosUser } from "./user";
import { TabPosBarang } from "./barang";

@Entity('tab_history_barang')
export class TabHistoryBarang {
    @PrimaryGeneratedColumn()
    id_history_barang: string

    @ManyToOne(()=>TabPosUser)
    @JoinColumn({name: 'id_user'})
    id_user: TabPosUser

    @ManyToOne(()=>TabPosBarang)
    @JoinColumn({name: 'id_barang'})
    id_barang: TabPosBarang

    @Column({nullable: true})
    qty: number

    @Column({nullable: true})
    keterangan: string

    @Column({nullable: true})
    tanggal_updated: string
}