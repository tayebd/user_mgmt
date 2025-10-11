const nextJest = require('next/jest')

// Providing the path to your Next.js app which will enable loading next.config.js and .env files
const createJestConfig = nextJest({
  dir: './'
})

/** @type {import('jest').Config} */
const customJestConfig = {
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Explicitly map the dynamic routes
    '@/app/surveys/\[id\]/respond/theme': '<rootDir>/src/app/surveys/[id]/respond/theme.ts',
    '@/app/surveys/\[id\]/respond/page': '<rootDir>/src/app/surveys/[id]/respond/page.tsx',
    'react-markdown': '<rootDir>/src/__mocks__/react-markdown.js'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: {
    '^.+\.(ts|tsx|js|jsx|mjs)$': ['babel-jest', { presets: ['next/babel'] }],
    '^.+\.m?js$': ['babel-jest', { presets: ['@babel/preset-env'] }]
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(survey-core|survey-react-ui|react-markdown|remark-math|rehype-mathjax|unified|micromark|mdast-util-.*|unist-util-.*|vfile.*|bail|trough|is-plain-obj|decode-named-character-reference|character-entities|property-information|space-separated-tokens|comma-separated-tokens|hast-util-whitespace|@types/mdast|@types/unist|@types/hast|@types/estree|@types/unist|@types/vfile|@types/vfile-message|@types/react-markdown)/).*'
  ],
  testEnvironmentOptions: {
    customExportConditions: ['react-jsx']
  },
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  testPathIgnorePatterns: ['/node_modules/', '/src/app/surveys/\[id\]/'],
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  // Improve error handling and test output
  verbose: true,
  testTimeout: 10000,
  maxWorkers: '50%',
  errorOnDeprecated: true,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
