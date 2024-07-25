import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtPayload } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/services/Auth/AuthServices';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authServices: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_KEY'),
    });
  }

  async validate(payload: JwtPayload): Promise<{ data?: any, message?: any, statusCode: number }> {
    const user = await this.authServices.findById(payload.sub);
    if (!user) {
      return { message: 'not authorized', statusCode: HttpStatus.BAD_REQUEST };
    }
    return { data: user, statusCode: HttpStatus.OK };
  }
}
