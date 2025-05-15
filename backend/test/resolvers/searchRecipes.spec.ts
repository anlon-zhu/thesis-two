import { ApolloServer, gql } from 'apollo-server-express';
import { typeDefs } from '../../src/graphql/schema';
import { recipeResolvers } from '../../src/graphql/resolvers/recipe.resolver';
import { PrismaService } from '../../src/prisma/prisma.service';

// Mock PrismaService
const mockPrismaService = {
  recipe: {
    findMany: jest.fn(),
  },
} as unknown as PrismaService;

describe('Search Recipes Resolver', () => {
  let server: ApolloServer;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create the Apollo Server with our schema and resolvers
    server = new ApolloServer({
      typeDefs,
      resolvers: recipeResolvers,
      context: () => ({ prisma: mockPrismaService }),
    });
  });

  it('should search recipes by title or description', async () => {
    // Mock recipe search results
    const mockRecipes = [
      {
        id: 'recipe-1',
        title: 'Spaghetti Carbonara',
        description: 'Classic Italian pasta dish',
        cookTimeMinutes: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
          id: 'user-1',
          email: 'chef@example.com',
          name: 'Chef',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        recipeIngredients: [
          {
            id: 'ingredient-relation-1',
            quantity: 500,
            unit: 'g',
            ingredient: {
              id: 'ingredient-1',
              name: 'Pasta',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        ],
        steps: [
          {
            id: 'step-1',
            stepNumber: 1,
            instruction: 'Cook pasta',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'recipe-2',
        title: 'Pasta Primavera',
        description: 'Light and healthy pasta with vegetables',
        cookTimeMinutes: 25,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
          id: 'user-1',
          email: 'chef@example.com',
          name: 'Chef',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        recipeIngredients: [
          {
            id: 'ingredient-relation-2',
            quantity: 400,
            unit: 'g',
            ingredient: {
              id: 'ingredient-1',
              name: 'Pasta',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        ],
        steps: [
          {
            id: 'step-2',
            stepNumber: 1,
            instruction: 'Cook pasta',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    ];

    // Set up the mock to return our test data
    mockPrismaService.recipe.findMany.mockResolvedValueOnce(mockRecipes);

    // Define the query
    const SEARCH_RECIPES = gql`
      query SearchRecipes($query: String!) {
        searchRecipes(query: $query) {
          id
          title
          description
          cookTimeMinutes
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

    // Execute the query
    const result = await server.executeOperation({
      query: SEARCH_RECIPES,
      variables: { query: 'pasta' },
    });

    // Assertions
    expect(result.errors).toBeUndefined();
    expect(result.data?.searchRecipes).toHaveLength(2);
    expect(result.data?.searchRecipes[0].title).toBe('Spaghetti Carbonara');
    expect(result.data?.searchRecipes[1].title).toBe('Pasta Primavera');

    // Verify that Prisma was called with the right arguments
    expect(mockPrismaService.recipe.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrismaService.recipe.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { title: { contains: 'pasta', mode: 'insensitive' } },
          { description: { contains: 'pasta', mode: 'insensitive' } },
        ],
      },
      include: {
        recipeIngredients: {
          include: {
            ingredient: true,
          },
        },
        steps: true,
        user: true,
      },
    });
  });

  it('should return empty array when no recipes match the search', async () => {
    // Set up the mock to return empty array
    mockPrismaService.recipe.findMany.mockResolvedValueOnce([]);

    // Define the query
    const SEARCH_RECIPES = gql`
      query SearchRecipes($query: String!) {
        searchRecipes(query: $query) {
          id
          title
        }
      }
    `;

    // Execute the query
    const result = await server.executeOperation({
      query: SEARCH_RECIPES,
      variables: { query: 'nonexistent' },
    });

    // Assertions
    expect(result.errors).toBeUndefined();
    expect(result.data?.searchRecipes).toEqual([]);
    
    // Verify that Prisma was called with the right arguments
    expect(mockPrismaService.recipe.findMany).toHaveBeenCalledTimes(1);
  });
});
