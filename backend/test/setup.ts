import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.test file for test environment
dotenv.config({
  path: path.resolve(__dirname, '../.env.test'),
});

// Add any global test setup here
