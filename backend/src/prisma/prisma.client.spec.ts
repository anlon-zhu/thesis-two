import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { join } from 'path';
import * as fs from 'fs';

describe('PrismaClient', () => {
  let prisma: PrismaClient;
  const databaseUrl = 'file:./test.db';

  // Set up a fresh in-memory SQLite database for each test
  beforeAll(async () => {
    // Create test.env file with SQLite connection string
    const testEnvPath = join(__dirname, '../..', '.env.test');
    fs.writeFileSync(testEnvPath, `DATABASE_URL=${databaseUrl}`);

    // Set DATABASE_URL and run migrations programmatically
    process.env.DATABASE_URL = databaseUrl;
    
    // Initialize Prisma client
    prisma = new PrismaClient();
    await prisma.$connect();
  });

  // Clean up after all tests
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // Clean database between tests
  beforeEach(async () => {
    // Delete in order to respect foreign key constraints
    await prisma.recipeStep.deleteMany();
    await prisma.recipeIngredient.deleteMany();
    await prisma.recipe.deleteMany();
    await prisma.ingredient.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('User', () => {
    it('should create a user and fetch by id', async () => {
      // Given
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      // When
      const createdUser = await prisma.user.create({
        data: userData,
      });

      // Then
      expect(createdUser).toHaveProperty('id');
      expect(createdUser.email).toBe(userData.email);

      // Verify we can fetch the user by ID
      const fetchedUser = await prisma.user.findUnique({
        where: { id: createdUser.id },
      });

      expect(fetchedUser).not.toBeNull();
      expect(fetchedUser?.email).toBe(userData.email);
      expect(fetchedUser?.name).toBe(userData.name);
    });
  });

  describe('Ingredient', () => {
    it('should create an ingredient', async () => {
      // Given
      const ingredientData = {
        name: 'Salt',
      };

      // When
      const createdIngredient = await prisma.ingredient.create({
        data: ingredientData,
      });

      // Then
      expect(createdIngredient).toHaveProperty('id');
      expect(createdIngredient.name).toBe(ingredientData.name);
    });

    it('should enforce unique constraint on ingredient name', async () => {
      // Given
      const ingredientData = {
        name: 'Sugar',
      };

      // When
      await prisma.ingredient.create({
        data: ingredientData,
      });

      // Then
      await expect(
        prisma.ingredient.create({
          data: ingredientData,
        })
      ).rejects.toThrow();
    });
  });

  describe('Recipe with nested relationships', () => {
    it('should create a recipe with nested ingredients and steps', async () => {
      // Given
      // Create a user first
      const user = await prisma.user.create({
        data: {
          email: 'chef@example.com',
          name: 'Master Chef',
        },
      });

      // Create ingredients
      const flour = await prisma.ingredient.create({
        data: { name: 'Flour' },
      });

      const water = await prisma.ingredient.create({
        data: { name: 'Water' },
      });

      // Recipe data with nested creates
      const recipeData = {
        title: 'Simple Bread',
        description: 'A basic bread recipe',
        cookTimeMinutes: 60,
        userId: user.id,
        recipeIngredients: {
          create: [
            {
              ingredient: { connect: { id: flour.id } },
              quantity: 500,
              unit: 'g',
            },
            {
              ingredient: { connect: { id: water.id } },
              quantity: 300,
              unit: 'ml',
            },
          ],
        },
        steps: {
          create: [
            {
              stepNumber: 1,
              instruction: 'Mix flour and water',
            },
            {
              stepNumber: 2,
              instruction: 'Knead for 10 minutes',
            },
            {
              stepNumber: 3,
              instruction: 'Bake at 200°C for 30 minutes',
            },
          ],
        },
      };

      // When
      const createdRecipe = await prisma.recipe.create({
        data: recipeData,
        include: {
          recipeIngredients: {
            include: {
              ingredient: true,
            },
          },
          steps: true,
        },
      });

      // Then
      expect(createdRecipe).toHaveProperty('id');
      expect(createdRecipe.title).toBe(recipeData.title);
      expect(createdRecipe.cookTimeMinutes).toBe(recipeData.cookTimeMinutes);
      
      // Check nested ingredients
      expect(createdRecipe.recipeIngredients).toHaveLength(2);
      expect(createdRecipe.recipeIngredients[0].ingredient.name).toBe('Flour');
      expect(createdRecipe.recipeIngredients[1].ingredient.name).toBe('Water');
      
      // Check nested steps
      expect(createdRecipe.steps).toHaveLength(3);
      expect(createdRecipe.steps[0].stepNumber).toBe(1);
      expect(createdRecipe.steps[1].stepNumber).toBe(2);
      expect(createdRecipe.steps[2].stepNumber).toBe(3);

      // Verify we can fetch the recipe with includes
      const fetchedRecipe = await prisma.recipe.findUnique({
        where: { id: createdRecipe.id },
        include: {
          recipeIngredients: {
            include: {
              ingredient: true,
            },
          },
          steps: true,
        },
      });

      expect(fetchedRecipe).not.toBeNull();
      expect(fetchedRecipe?.title).toBe(recipeData.title);
      expect(fetchedRecipe?.recipeIngredients).toHaveLength(2);
      expect(fetchedRecipe?.steps).toHaveLength(3);
    });
  });
});
