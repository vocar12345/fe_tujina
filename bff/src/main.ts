import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow the Angular app (any origin in this demo) to call the BFF. In a real
  // deployment this would be restricted to the known frontend origin(s).
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
