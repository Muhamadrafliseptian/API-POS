import { Controller, Post, Body, HttpStatus, Param } from '@nestjs/common';
import { AuthService } from '../../services/Auth/AuthServices'
import { TabPosUser } from 'src/entities/user';

@Controller('api')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('auth/login')
    async login(@Body() params: TabPosUser): Promise<any> {
        const user = await this.authService.validateUser(params);
        if (!user) {
            return { message: 'Please check again your password or phone number', statusCode: HttpStatus.BAD_REQUEST }
        }
        const data = await this.authService.generateAccessToken(user);
        return { data, user };
    }

    @Post('auth/create/user')
    async createOwner(@Body() params: TabPosUser): Promise<any> {
        try {
            const response = await this.authService.createOwner(params)
            return response
        } catch (err){
            return err
        }
    }

    @Post('auth/:id_user/detail_profile')
    async showProfile(@Param('id_user') id_user: string): Promise<any> { 
        try {
            const response = await this.authService.detailProfile(id_user)
            return response
        } catch (err){
            return err
        }
    }

    @Post('auth/:id_user/update_profile')
    async updateProfile(@Param("id_user") id_user: string, @Body() data: Partial<TabPosUser>): Promise<any>{
        try {
            const response = await this.authService.updateProfile(id_user, data)
            return response
        } catch (err){
            return err
        }
    }

    @Post('user/all')
    async getAllUser(): Promise<any>{
        try {
            const response = await this.authService.getUser()
            return response
        } catch (err){
            return err
        }
    }
}
