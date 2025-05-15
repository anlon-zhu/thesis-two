# Recipe Social App - Backend

This is the backend server for a recipe-based social application built with NestJS and GraphQL. The server provides a GraphQL API for managing recipes, ingredients, and user interactions.

## Features

- GraphQL API with Apollo Server
- User management (CRUD operations)
- Recipe management with ingredients and steps
- Search functionality for recipes
- Type-safe database operations with Prisma ORM
- Comprehensive testing suite

## Tech Stack

- **Framework**: NestJS
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma
- **GraphQL**: Apollo Server
- **Testing**: Jest, Supertest, Apollo Server Testing
- **TypeScript**: Strict type checking

## Project Structure

```
backend/
├── prisma/               # Prisma database schema and migrations
├── src/                 # Source code
│   ├── app.module.ts    # Main NestJS module
│   ├── main.ts         # Application entry point
│   ├── prisma/         # Prisma client and service
│   └── graphql/        # GraphQL schema and resolvers
└── test/               # Test files
    ├── integration/    # End-to-end tests
    ├── resolvers/     # GraphQL resolver tests
    └── prisma/        # Prisma client tests
```

## Database Schema

The database schema includes the following models:

- **User**: Stores user information and owns recipes
- **Recipe**: Contains recipe details and references ingredients and steps
- **Ingredient**: Stores ingredient information
- **RecipeIngredient**: Junction table linking recipes to ingredients with quantities
- **RecipeStep**: Stores recipe preparation steps

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- SQLite (for development)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with your database configuration:
   ```
   DATABASE_URL="sqlite:./dev.db"
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

4. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

### Running the Application

1. Development mode:
   ```bash
   npm run start:dev
   ```

2. Production mode:
   ```bash
   npm run start
   ```

The GraphQL API will be available at `http://localhost:3000/graphql`

### Running Tests

1. Unit tests:
   ```bash
   npm test
   ```

2. Watch mode:
   ```bash
   npm test:watch
   ```

3. Coverage report:
   ```bash
   npm test:cov
   ```

### API Documentation

The GraphQL API is self-documenting. You can access the GraphQL Playground at `http://localhost:3000/graphql` to explore available queries and mutations.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
