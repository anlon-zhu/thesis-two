import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

// Only start the server if this file is run directly
if (require.main === module) {
  bootstrap();
}

// Export bootstrap function for testing
export { bootstrap };
