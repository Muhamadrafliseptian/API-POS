import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TabPosUser } from "./user";
import { TabPosTransaksiDetail } from "./transaksi_detail";
import { TabScheduleShift } from "./schedule_shift";

@Entity('tab_pos_transaksi')
export class TabPosTransaksi {
    @PrimaryGeneratedColumn()
    id_transaksi: string;

    @ManyToOne(() => TabPosUser)
    @JoinColumn({ name: 'id_user' })
    id_user: TabPosUser;

    @Column('double', { nullable: true })
    in_amount: number;

    @Column('double', { nullable: true })
    return_amount: number;

    @Column('double', { nullable: true })
    total_amount: number;

    @Column({ nullable: true })
    status_transaksi: string;

    @Column({ nullable: true })
    nama_shift: string;

    @Column({ nullable: true })
    tanggal_transaksi: string;

    @OneToMany(() => TabPosTransaksiDetail, detail => detail.id_transaksi)
    details: TabPosTransaksiDetail[];

    @ManyToOne(() => TabScheduleShift)
    @JoinColumn({ name: 'id_schedule' })
    id_schedule: TabScheduleShift;
}