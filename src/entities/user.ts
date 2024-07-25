import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TabPosRole } from "./role";

@Entity('tab_pos_user')
export class TabPosUser {
    @PrimaryGeneratedColumn()
    id_user: string

    @Column({nullable: true})
    nama: string

    @Column({nullable: true})
    password: string

    @Column({nullable: true})
    nomor_telepon: string

    @ManyToOne(()=>TabPosRole)
    @JoinColumn({name: 'role_id'})
    role_id: TabPosRole
}