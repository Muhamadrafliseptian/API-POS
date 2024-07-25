import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  dotenv.config({ path: './.env' });

  app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.enableCors();

  const port = process.env.PORT || 3002;
  await app.listen(port);
}

bootstrap();
