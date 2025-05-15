import { ApolloServer, gql } from 'apollo-server-express';
import { typeDefs } from '../../src/graphql/schema';
import { ingredientResolvers } from '../../src/graphql/resolvers/ingredient.resolver';
import { PrismaService } from '../../src/prisma/prisma.service';

// Mock PrismaService
const mockPrismaService = {
  ingredient: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
} as unknown as PrismaService;

describe('Add Ingredient Resolver', () => {
  let server: ApolloServer;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create the Apollo Server with our schema and resolvers
    server = new ApolloServer({
      typeDefs,
      resolvers: ingredientResolvers,
      context: () => ({ prisma: mockPrismaService }),
    });
  });

  it('should create a new ingredient', async () => {
    // Mock data
    const newIngredient = {
      id: 'mock-ingredient-id',
      name: 'Salt',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Set up the mock to return our test data
    mockPrismaService.ingredient.create.mockResolvedValueOnce(newIngredient);

    // Define the mutation
    const ADD_INGREDIENT = gql`
      mutation AddIngredient($name: String!) {
        addIngredient(name: $name) {
          id
          name
          createdAt
          updatedAt
        }
      }
    `;

    // Execute the mutation
    const result = await server.executeOperation({
      query: ADD_INGREDIENT,
      variables: { name: 'Salt' },
    });

    // Assertions
    expect(result.errors).toBeUndefined();
    expect(result.data?.addIngredient).toEqual(newIngredient);

    // Verify that Prisma was called with the right arguments
    expect(mockPrismaService.ingredient.create).toHaveBeenCalledTimes(1);
    expect(mockPrismaService.ingredient.create).toHaveBeenCalledWith({
      data: { name: 'Salt' },
    });
  });

  it('should handle errors when ingredient creation fails', async () => {
    // Set up the mock to throw an error
    mockPrismaService.ingredient.create.mockRejectedValueOnce(
      new Error('Ingredient with this name already exists')
    );

    // Define the mutation
    const ADD_INGREDIENT = gql`
      mutation AddIngredient($name: String!) {
        addIngredient(name: $name) {
          id
          name
        }
      }
    `;

    // Execute the mutation
    const result = await server.executeOperation({
      query: ADD_INGREDIENT,
      variables: { name: 'Salt' },
    });

    // Assertions
    expect(result.errors).toBeDefined();
    expect(result.errors?.[0].message).toContain('Ingredient with this name already exists');
  });
});
