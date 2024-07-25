import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { AuthService } from '../../services/Auth/AuthServices'
import { TabPosUser } from 'src/entities/user';

@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() params: TabPosUser): Promise<any> {
        const user = await this.authService.validateUser(params);
        if (!user) {
            return { message: 'Please check again your password or phone number', statusCode: HttpStatus.BAD_REQUEST }
        }
        const data = await this.authService.generateAccessToken(user);
        return { data, user };
    }

    @Post('create/owner')
    async createOwner(@Body() params: TabPosUser): Promise<any> {
        try {
            const response = await this.authService.createOwner(params)
            return response
        } catch (err){
            return err
        }
    }

    @Post('create/officer')
    async createPemilik(@Body() params: TabPosUser): Promise<any> { 
        try {
            const response = await this.authService.createOfficer(params)
            return response
        } catch (err){
            return err
        }
    }
}
