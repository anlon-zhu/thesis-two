import { PrismaService } from '../../prisma/prisma.service';

export const recipeResolvers = {
  Query: {
    recipes: (_parent, _args, { prisma }: { prisma: PrismaService }) => {
      return prisma.recipe.findMany({
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
    },
    
    recipe: (_parent, { id }, { prisma }: { prisma: PrismaService }) => {
      return prisma.recipe.findUnique({
        where: { id },
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
    },
    
    searchRecipes: (_parent, { query }, { prisma }: { prisma: PrismaService }) => {
      return prisma.recipe.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
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
    },
    
    getUserRecipes: (_parent, { userId }, { prisma }: { prisma: PrismaService }) => {
      return prisma.recipe.findMany({
        where: { userId },
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
    },
  },
  
  Mutation: {
    addRecipe: async (_parent, { recipe }, { prisma, userId }: { prisma: PrismaService, userId: string }) => {
      const { title, description, cookTimeMinutes = 0, ingredients, steps } = recipe;
      
      // Create the recipe with nested relations
      return prisma.recipe.create({
        data: {
          title,
          description,
          cookTimeMinutes,
          userId,
          recipeIngredients: {
            create: await Promise.all(ingredients.map(async ({ ingredientId, ingredientName, quantity, unit }) => {
              // If ingredientId is provided, use it. Otherwise, create or find by name.
              let ingredient;
              if (ingredientId) {
                ingredient = { connect: { id: ingredientId } };
              } else {
                // Try to find existing ingredient or create new one
                const existingIngredient = await prisma.ingredient.findUnique({
                  where: { name: ingredientName },
                });
                
                if (existingIngredient) {
                  ingredient = { connect: { id: existingIngredient.id } };
                } else {
                  ingredient = { create: { name: ingredientName } };
                }
              }
              
              return {
                quantity,
                unit,
                ingredient,
              };
            })),
          },
          steps: {
            create: steps.map(({ stepNumber, instruction }) => ({
              stepNumber,
              instruction,
            })),
          },
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
    },
  },
  
  Recipe: {
    ingredients: (parent, _args, { prisma }: { prisma: PrismaService }) => {
      return parent.recipeIngredients || [];
    },
  },
};
