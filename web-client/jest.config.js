module.exports = {
  // 测试环境
  testEnvironment: 'jsdom',

  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],

  // 模块路径映射
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
  },

  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],

  // 忽略的文件模式
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],

  // 覆盖率收集
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/test/**/*',
    '!src/**/__tests__/**/*',
    '!src/**/*.test.*',
    '!src/**/*.spec.*',
  ],

  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // 覆盖率报告格式
  coverageReporters: ['text', 'text-summary', 'html', 'lcov'],

  // 覆盖率输出目录
  coverageDirectory: 'coverage',

  // 模块文件扩展名
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],

  // 转换配置
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          jsx: 'react-jsx',
        },
      },
    ],
    '^.+\\.(js|jsx)$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          ['@babel/preset-react', { runtime: 'automatic' }],
        ],
      },
    ],
  },

  // 忽略转换的模块
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@testing-library|framer-motion))',
  ],

  // 模块目录
  moduleDirectories: ['node_modules', '<rootDir>/src'],

  // 静态资源模拟
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/test/__mocks__/fileMock.js',
  },

  // 全局设置
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },

  // 测试超时
  testTimeout: 10000,

  // 详细输出
  verbose: true,

  // 清除模拟
  clearMocks: true,

  // 恢复模拟
  restoreMocks: true,

  // 监视文件变化
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/',
  ],

  // 错误时继续
  bail: false,

  // 缓存目录
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',

  // 最大工作进程
  maxWorkers: '50%',

  // 报告器
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'junit.xml',
      },
    ],
  ],

  // 预设
  preset: 'ts-jest/presets/default-esm',
};
