import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TabPosKategoriBarang } from "./kategori";

@Entity('tab_pos_barang')
export class TabPosBarang {
    @PrimaryGeneratedColumn()
    id_barang: string

    @Column({ nullable: true })
    nama: string

    @Column({ nullable: true })
    code: string

    @Column(('double'), { nullable: true })
    amount: number

    @Column(('double'), { nullable: true })
    amount_default: number

    @Column(('double'), { nullable: true })
    qty: number

    @Column({ nullable: true })
    added_at: string

    @ManyToOne(() => TabPosKategoriBarang)
    @JoinColumn({ name: 'kategori_id' })
    kategori_id: TabPosKategoriBarang
}