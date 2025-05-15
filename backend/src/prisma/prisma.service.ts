import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      // Log queries only in development
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper method to clean the database between tests
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'test') {
      // Delete in order to respect foreign key constraints
      await this.$transaction([
        this.recipeStep.deleteMany(),
        this.recipeIngredient.deleteMany(),
        this.recipe.deleteMany(),
        this.ingredient.deleteMany(),
        this.user.deleteMany(),
      ]);
    }
  }
}
