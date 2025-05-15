import { PrismaService } from '../../prisma/prisma.service';

export const ingredientResolvers = {
  Query: {
    ingredients: (_parent, _args, { prisma }: { prisma: PrismaService }) => {
      return prisma.ingredient.findMany();
    },
    
    ingredient: (_parent, { id }, { prisma }: { prisma: PrismaService }) => {
      return prisma.ingredient.findUnique({
        where: { id },
      });
    },
  },
  
  Mutation: {
    addIngredient: async (_parent, { name }, { prisma }: { prisma: PrismaService }) => {
      return prisma.ingredient.create({
        data: { name },
      });
    },
  },
};
