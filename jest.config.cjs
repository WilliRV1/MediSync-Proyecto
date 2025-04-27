// jest.config.js
module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
      '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
      '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js'
    },
    transformIgnorePatterns: [
       '/node_modules/(?!axios|react-icons|otras-librerias-esmodules/).+\\.js$'
     ],
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    collectCoverageFrom: [
       'src/**/*.{js,jsx}',
       '!src/main.jsx',
       '!src/App.jsx',
       '!src/**/*.test.{js,jsx}',
       '!src/vite-env.d.ts',
     ],
    coverageDirectory: 'coverage',
};
