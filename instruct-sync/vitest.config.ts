import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    pool: 'forks',
    forks: {
      singleFork: true,
    },
    testTimeout: 120000,
    hookTimeout: 120000,
    globals: true,
    // Force no isolation and low concurrency for stability on this machine
    isolate: false,
    maxConcurrency: 1,
  },
})
