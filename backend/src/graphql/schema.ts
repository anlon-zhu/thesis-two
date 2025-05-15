import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String
    recipes: [Recipe!]
    createdAt: String!
    updatedAt: String!
  }

  type Ingredient {
    id: ID!
    name: String!
    createdAt: String!
    updatedAt: String!
  }

  type Recipe {
    id: ID!
    title: String!
    description: String
    cookTimeMinutes: Int!
    user: User!
    ingredients: [RecipeIngredient!]!
    steps: [RecipeStep!]!
    createdAt: String!
    updatedAt: String!
  }

  type RecipeIngredient {
    id: ID!
    recipe: Recipe!
    ingredient: Ingredient!
    quantity: Float!
    unit: String
    createdAt: String!
    updatedAt: String!
  }

  type RecipeStep {
    id: ID!
    recipe: Recipe!
    stepNumber: Int!
    instruction: String!
    createdAt: String!
    updatedAt: String!
  }

  input RecipeIngredientInput {
    ingredientId: ID
    ingredientName: String
    quantity: Float!
    unit: String
  }

  input RecipeStepInput {
    stepNumber: Int!
    instruction: String!
  }

  input RecipeInput {
    title: String!
    description: String
    cookTimeMinutes: Int
    ingredients: [RecipeIngredientInput!]!
    steps: [RecipeStepInput!]!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    ingredients: [Ingredient!]!
    ingredient(id: ID!): Ingredient
    recipes: [Recipe!]!
    recipe(id: ID!): Recipe
    searchRecipes(query: String!): [Recipe!]!
    getUserRecipes(userId: ID!): [Recipe!]!
  }

  type Mutation {
    addIngredient(name: String!): Ingredient!
    addRecipe(recipe: RecipeInput!): Recipe!
    updateRecipe(id: ID!, recipe: RecipeInput!): Recipe!
    deleteRecipe(id: ID!): Boolean!
  }
`;
