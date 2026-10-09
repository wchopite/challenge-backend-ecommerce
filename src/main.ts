import { ValidationPipe } from '@nestjs/common';
import { NestFactory, type NestApplication } from '@nestjs/core';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import { setupSwagger } from './shared/infrastructure/http/swagger.js';

const JSON_BODY_LIMIT = '16kb';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestApplication>(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });

  app.useLogger(app.get(Logger));

  app.enableShutdownHooks();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.useBodyParser('json', { limit: JSON_BODY_LIMIT });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app);
  }

  const rawPort = process.env.PORT;
  const port = rawPort !== undefined ? Number(rawPort) : 3000;

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a positive integer');
  }

  await app.listen(port);
  app.get(Logger).log(`App running on http://localhost:${port}`);
}

void bootstrap();
