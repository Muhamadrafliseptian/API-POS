import { IsNotEmpty, IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ItemDto {
    @IsNotEmpty()
    @IsString()
    id_barang: string;

    @IsNotEmpty()
    @IsNumber()
    qty: number;
}

export class ProcessTransactionDto {
    @IsNotEmpty()
    @IsString()
    id_user: string;
    in_amount: number;

    nama_shift: string;

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ItemDto)
    items: ItemDto[];
}
