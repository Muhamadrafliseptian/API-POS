import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('tab_pos_kategori_barang')
export class TabPosKategoriBarang {
    @PrimaryGeneratedColumn()
    id_kategori_barang: string

    @Column({nullable: true})
    nama: string

    @Column({nullable: true})
    code: string
}