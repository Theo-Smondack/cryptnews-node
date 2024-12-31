import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>src/tests'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: [
    '**/src/tests/**/*.(ts|js)',
    '**/src/tests/**/?(*.)+(spec|test).(ts|js)',
  ],
  collectCoverage: true,
  collectCoverageFrom: ['src/tests/**/*.{ts,js}', '!src/tests/**/*.d.ts'],
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/tests/$1',
  },
};

export default config;
