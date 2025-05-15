import { ApolloServer, gql } from 'apollo-server-express';
import { typeDefs } from '../../src/graphql/schema';
import { recipeResolvers } from '../../src/graphql/resolvers/recipe.resolver';
import { PrismaService } from '../../src/prisma/prisma.service';

// Mock PrismaService
const mockPrismaService = {
  recipe: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  ingredient: {
    findUnique: jest.fn(),
  },
} as unknown as PrismaService;

describe('Add Recipe Resolver', () => {
  let server: ApolloServer;
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create the Apollo Server with our schema and resolvers
    server = new ApolloServer({
      typeDefs,
      resolvers: recipeResolvers,
      context: () => ({ 
        prisma: mockPrismaService,
        userId: mockUserId 
      }),
    });
  });

  it('should create a new recipe with ingredients and steps', async () => {
    // Mock ingredient data
    const existingIngredient = {
      id: 'existing-ingredient-id',
      name: 'Salt',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockPrismaService.ingredient.findUnique.mockResolvedValueOnce(existingIngredient);
    mockPrismaService.ingredient.findUnique.mockResolvedValueOnce(null); // Second ingredient doesn't exist

    // Mock new recipe data
    const newRecipe = {
      id: 'mock-recipe-id',
      title: 'Pasta Carbonara',
      description: 'Classic Italian pasta dish',
      cookTimeMinutes: 30,
      userId: mockUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recipeIngredients: [
        {
          id: 'ingredient-relation-1',
          quantity: 500,
          unit: 'g',
          ingredient: existingIngredient,
        },
        {
          id: 'ingredient-relation-2',
          quantity: 200,
          unit: 'ml',
          ingredient: {
            id: 'new-ingredient-id',
            name: 'Water',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      ],
      steps: [
        {
          id: 'step-1',
          stepNumber: 1,
          instruction: 'Boil water',
        },
        {
          id: 'step-2',
          stepNumber: 2,
          instruction: 'Cook pasta',
        },
      ],
      user: {
        id: mockUserId,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    // Set up the mock to return our test data
    mockPrismaService.recipe.create.mockResolvedValueOnce(newRecipe);

    // Define the mutation
    const ADD_RECIPE = gql`
      mutation AddRecipe($recipe: RecipeInput!) {
        addRecipe(recipe: $recipe) {
          id
          title
          description
          cookTimeMinutes
          ingredients {
            id
            quantity
            unit
            ingredient {
              id
              name
            }
          }
          steps {
            id
            stepNumber
            instruction
          }
        }
      }
    `;

    // Execute the mutation
    const result = await server.executeOperation({
      query: ADD_RECIPE,
      variables: {
        recipe: {
          title: 'Pasta Carbonara',
          description: 'Classic Italian pasta dish',
          cookTimeMinutes: 30,
          ingredients: [
            {
              ingredientId: 'existing-ingredient-id',
              quantity: 500,
              unit: 'g',
            },
            {
              ingredientName: 'Water',
              quantity: 200,
              unit: 'ml',
            },
          ],
          steps: [
            {
              stepNumber: 1,
              instruction: 'Boil water',
            },
            {
              stepNumber: 2,
              instruction: 'Cook pasta',
            },
          ],
        },
      },
    });

    // Assertions
    expect(result.errors).toBeUndefined();
    expect(result.data?.addRecipe).toBeDefined();
    expect(result.data?.addRecipe.title).toBe('Pasta Carbonara');
    expect(result.data?.addRecipe.description).toBe('Classic Italian pasta dish');
    expect(result.data?.addRecipe.cookTimeMinutes).toBe(30);
    
    // Verify ingredients
    expect(result.data?.addRecipe.ingredients).toHaveLength(2);
    
    // Verify steps
    expect(result.data?.addRecipe.steps).toHaveLength(2);
    expect(result.data?.addRecipe.steps[0].stepNumber).toBe(1);
    expect(result.data?.addRecipe.steps[1].stepNumber).toBe(2);

    // Verify that Prisma was called with the right arguments
    expect(mockPrismaService.recipe.create).toHaveBeenCalledTimes(1);
    expect(mockPrismaService.recipe.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        title: 'Pasta Carbonara',
        description: 'Classic Italian pasta dish',
        cookTimeMinutes: 30,
        userId: mockUserId,
      }),
      include: expect.objectContaining({
        recipeIngredients: expect.objectContaining({
          include: expect.objectContaining({
            ingredient: true,
          }),
        }),
        steps: true,
        user: true,
      }),
    }));
  });

  it('should handle errors when recipe creation fails', async () => {
    // Set up the mock to throw an error
    mockPrismaService.recipe.create.mockRejectedValueOnce(
      new Error('Failed to create recipe')
    );

    // Define the mutation
    const ADD_RECIPE = gql`
      mutation AddRecipe($recipe: RecipeInput!) {
        addRecipe(recipe: $recipe) {
          id
          title
        }
      }
    `;

    // Execute the mutation
    const result = await server.executeOperation({
      query: ADD_RECIPE,
      variables: {
        recipe: {
          title: 'Failed Recipe',
          ingredients: [],
          steps: [],
        },
      },
    });

    // Assertions
    expect(result.errors).toBeDefined();
    expect(result.errors?.[0].message).toContain('Failed to create recipe');
  });
});
