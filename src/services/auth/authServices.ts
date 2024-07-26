import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { TabPosUser } from 'src/entities/user';
import * as bcrypt from 'bcrypt'
import { TabPosRole } from 'src/entities/role';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(TabPosUser)
        private usersRepository: Repository<TabPosUser>,
        @InjectRepository(TabPosRole)
        private roleRepository: Repository<TabPosRole>,
        private readonly jwtService: JwtService,
    ) { }

    async generateAccessToken(user: TabPosUser): Promise<any> {
        const payload = { username: user.nomor_telepon };
        const response = await this.jwtService.sign(payload)
        return { message: "success login", accessToken: response, statusCode: HttpStatus.OK }
    }
    async findById(sub: any): Promise<any> {
        const user = await this.usersRepository.findOne({
            where: { nomor_telepon: sub }
        });
        return { data: user, statusCode: HttpStatus.OK };
    }
    async validateUser(params: TabPosUser): Promise<TabPosUser | null> {
        const { nomor_telepon, password } = params
        const user = await this.usersRepository.findOne({
            where: { nomor_telepon: nomor_telepon }
        });

        if (!user) {
            return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            console.log('Passwords do not match');
            return null;
        }

        return user;
    }

    async createOwner(params: TabPosUser): Promise<any> {
        try {
            const { nomor_telepon, password, nama, role_id } = params;

            const existingUser = await this.usersRepository.findOne({
                where: { nomor_telepon: nomor_telepon },
                relations: ['role_id']
            });

            if (existingUser) {
                return { message: 'Owner already exists', statusCode: HttpStatus.CONFLICT };
            }

            const findRole = await this.roleRepository.findOne({ where: { nama: 'owner' } });

            const passwordUser = await bcrypt.hash(password, 10);

            const createOwner = this.usersRepository.create({
                nama: nama,
                nomor_telepon: nomor_telepon,
                password: passwordUser
            });

            const saveData = await this.usersRepository.save(createOwner);

            return { message: 'success', statusCode: HttpStatus.CREATED };
        } catch (err) {
            console.log('====================================');
            console.log(err.message);
            console.log('====================================');
            return { message: err.message, statusCode: HttpStatus.BAD_REQUEST };
        }
    }

    async detailProfile(id_user: string):Promise<any>{
        try {
            const findUser = await this.usersRepository.findOne({where: {id_user: id_user}, relations: ['role_id']})

            return {data: findUser, statusCode: HttpStatus.OK}
        } catch (err){

        }
    }

    async updateProfile(id_user: string, updatedData: Partial<TabPosUser>): Promise<any> {
        try {
            const response = await this.usersRepository.findOne({
                where: { id_user },
                relations: ['role_id']
            });
            if (!response) {
                return { message: 'not found', statusCode: HttpStatus.NOT_FOUND };
            }

            if (updatedData.password) {
                updatedData.password = await bcrypt.hash(updatedData.password, 10);
            }

            Object.assign(response, updatedData);
            await this.usersRepository.save(response);

            return { message: 'Success Update Data', statusCode: HttpStatus.CREATED };
        } catch (err) {
            console.error('Error in updateProfile:', err.message);
            return { message: err.message, statusCode: HttpStatus.BAD_REQUEST };
        }
    }
}
