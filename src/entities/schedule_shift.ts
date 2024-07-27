import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('tab_pos_schedule_shift')
export class TabScheduleShift {
    @PrimaryGeneratedColumn()
    id_schedule_shift: string;

    @Column({ nullable: true })
    nama: string;

    @Column({ nullable: true })
    start_time: string;

    @Column({ nullable: true })
    end_time: string;
}