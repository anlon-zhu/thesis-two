import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { PrismaService } from './prisma/prisma.service';
import { ingredientResolvers } from './graphql/resolvers/ingredient.resolver';
import { recipeResolvers } from './graphql/resolvers/recipe.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      context: ({ req }) => {
        // In a real app, you'd extract the userId from authentication
        // For testing purposes, we'll use a header
        const userId = req?.headers['x-user-id'] || 'test-user-id';
        return { 
          userId,
          prisma: undefined, // Will be injected via plugin
        };
      },
      plugins: [
        {
          // This plugin injects the PrismaService into context
          requestDidStart: () => {
            return {
              willResolveField({ context }) {
                if (!context.prisma) {
                  // Inject the singleton PrismaService instance
                  context.prisma = module.get(PrismaService);
                }
                return null;
              },
            };
          },
        },
      ],
    }),
  ],
  providers: [
    PrismaService,
    {
      provide: 'RESOLVERS',
      useValue: {
        ...ingredientResolvers,
        ...recipeResolvers,
      },
    },
  ],
})
export class AppModule {
  // Reference to the module instance
  static module: any;
  
  constructor(moduleRef: any) {
    AppModule.module = moduleRef;
  }
}
