import type { Config } from '@jest/types';
import { defaults } from 'jest-config';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  roots: ['<rootDir>/src/', '<rootDir>/test/'],
  setupFiles: ['<rootDir>/test/setup.ts'],
  verbose: true,
  testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    // Mock external modules as needed
    '^firebase-admin$': '<rootDir>/test/mocks/firebase-admin.mock.ts',
    '^aws-sdk$': '<rootDir>/test/mocks/aws-s3.mock.ts',
  }
};

export default config;
