import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config/envs';

async function bootstrap() {
  const logger = new Logger('Payments-ms')
  
  const app = await NestFactory.create(AppModule,{
    rawBody: true
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // transform: true,
      forbidNonWhitelisted: true,
    })
  )

  await app.listen(envs.port);

  logger.log(`Payments-ms is running on port ${envs.port}`)
}
bootstrap();
