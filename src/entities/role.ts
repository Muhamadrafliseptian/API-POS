import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('tab_pos_role')
export class TabPosRole {
    @PrimaryGeneratedColumn()
    id_role: string

    @Column({nullable: true})
    nama: string
}