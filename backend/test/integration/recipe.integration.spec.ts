import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { join } from 'path';
import * as fs from 'fs';

describe('Recipe Integration', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let testUserId: string;

  // Setup the NestJS application before all tests
  beforeAll(async () => {
    // Create a test database file
    const dbPath = join(process.cwd(), 'test-integration.db');
    
    // Create .env.test file with test database URL
    const testEnvPath = join(process.cwd(), '.env.test');
    fs.writeFileSync(testEnvPath, `DATABASE_URL=file:${dbPath}`);
    
    // Set the DATABASE_URL for the test
    process.env.DATABASE_URL = `file:${dbPath}`;
    
    // Create test module with AppModule
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Create the application
    app = moduleRef.createNestApplication();
    
    // Get the PrismaService instance
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    
    // Ensure database is connected
    await prismaService.$connect();
    
    // Start the application
    await app.init();
    
    // Create a test user for our tests
    const user = await prismaService.user.create({
      data: {
        email: 'integration-test@example.com',
        name: 'Integration Test User',
      },
    });
    
    testUserId = user.id;
  });

  // Clean up after all tests
  afterAll(async () => {
    // Clean up the database
    await prismaService.cleanDatabase();
    await prismaService.$disconnect();
    
    // Close the application
    await app.close();
  });

  describe('GraphQL addRecipe', () => {
    it('should add a recipe and be able to fetch it', async () => {
      // The GraphQL mutation to add a recipe
      const addRecipeMutation = `
        mutation {
          addRecipe(recipe: {
            title: "Integration Test Recipe",
            description: "A recipe created during integration testing",
            cookTimeMinutes: 45,
            ingredients: [
              {
                ingredientName: "Test Ingredient 1",
                quantity: 200,
                unit: "g"
              },
              {
                ingredientName: "Test Ingredient 2",
                quantity: 3,
                unit: "tbsp"
              }
            ],
            steps: [
              {
                stepNumber: 1,
                instruction: "Mix ingredients"
              },
              {
                stepNumber: 2,
                instruction: "Cook for 30 minutes"
              },
              {
                stepNumber: 3,
                instruction: "Serve hot"
              }
            ]
          }) {
            id
            title
            description
            cookTimeMinutes
            ingredients {
              quantity
              unit
              ingredient {
                id
                name
              }
            }
            steps {
              stepNumber
              instruction
            }
          }
        }
      `;

      // Send the mutation request with the user ID header
      const addRecipeResponse = await request(app.getHttpServer())
        .post('/graphql')
        .set('x-user-id', testUserId)
        .send({ query: addRecipeMutation })
        .expect(200);

      // Extract the recipe ID from the response
      const recipeId = addRecipeResponse.body.data.addRecipe.id;
      expect(recipeId).toBeDefined();
      
      // Verify the recipe data was returned correctly
      const addedRecipe = addRecipeResponse.body.data.addRecipe;
      expect(addedRecipe.title).toBe('Integration Test Recipe');
      expect(addedRecipe.description).toBe('A recipe created during integration testing');
      expect(addedRecipe.cookTimeMinutes).toBe(45);
      expect(addedRecipe.ingredients).toHaveLength(2);
      expect(addedRecipe.steps).toHaveLength(3);

      // Now query for the user's recipes to verify it was saved
      const getUserRecipesQuery = `
        query {
          getUserRecipes(userId: "${testUserId}") {
            id
            title
            ingredients {
              quantity
              unit
              ingredient {
                name
              }
            }
            steps {
              stepNumber
              instruction
            }
          }
        }
      `;

      // Send the query request
      const recipesResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: getUserRecipesQuery })
        .expect(200);

      // Verify the recipe appears in the user's recipes
      const userRecipes = recipesResponse.body.data.getUserRecipes;
      expect(userRecipes).toHaveLength(1);
      expect(userRecipes[0].id).toBe(recipeId);
      expect(userRecipes[0].title).toBe('Integration Test Recipe');
    });
  });
});
