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
            const { nomor_telepon, password, nama } = params;

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
                password: passwordUser,
                role_id: { id_role: findRole.id_role }
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

    async createOfficer(params: TabPosUser): Promise<any> {
        try {
            const { nomor_telepon, password, nama } = params
            const response = await this.usersRepository.findOne({
                where: { nomor_telepon: nomor_telepon, nama: nama }
            })

            if (!response) {
                return
            }

            const findRole = await this.roleRepository.findOne({ where: { nama: 'officer' } })

            const passwordUser = await bcrypt.hash(password, 10)
            const createOwner = await this.usersRepository.create({
                nama,
                nomor_telepon,
                password: passwordUser,
                role_id: { id_role: findRole.id_role }
            })

            const saveData = await this.usersRepository.save(createOwner)

            return { message: 'success', statusCode: HttpStatus.CREATED }
        } catch (err) {
            return { message: err.message, statusCode: HttpStatus.BAD_REQUEST }
        }
    }
}
