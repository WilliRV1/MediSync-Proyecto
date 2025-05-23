    // jest.config.js
    module.exports = {
        // Entorno de prueba que simula un navegador (DOM)
        testEnvironment: 'jest-environment-jsdom',
  
        // Archivo que se ejecuta antes de cada suite de pruebas para configuración adicional
        setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
        // Cómo manejar diferentes tipos de archivos importados en los componentes
        moduleNameMapper: {
          // Mock para archivos CSS, SCSS, etc. -> Usa identity-obj-proxy
          '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
          // Mock para archivos de imagen/fuentes (puedes ajustar las extensiones)
          '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js' // Necesitaremos crear este mock
        },
  
        // Ignora transformaciones para node_modules excepto para módulos específicos si es necesario
        transformIgnorePatterns: [
           '/node_modules/(?!axios|react-icons|otras-librerias-esmodules/).+\\.js$'
         ],
  
        // Indica a Jest que use Babel para transformar archivos JS/JSX
        transform: {
          '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
        },

        // Ignora los tests E2E dentro de src/E2E
        testPathIgnorePatterns: ['/node_modules/', '/src/E2E/'],
  
         // Opcional: Recolectar cobertura de estos archivos
         collectCoverageFrom: [
           'src/**/*.{js,jsx}', // Ajusta si usas TypeScript (ts, tsx)
           '!src/main.jsx', // Excluir punto de entrada principal
           '!src/App.jsx', // A menudo se excluye el App principal o se prueba con E2E
           '!src/**/*.test.{js,jsx}', // Excluir archivos de prueba
           '!src/vite-env.d.ts', // Excluir archivos de tipos si usas Vite+TS
         ],
         // Opcional: Dónde guardar el reporte de cobertura
         coverageDirectory: 'coverage',
         // Opcional: Mínimo de cobertura requerido (puedes ajustarlo)
         // coverageThreshold: {
         //   global: {
         //     branches: 80,
         //     functions: 80,
         //     lines: 80,
         //     statements: -10,
         //   },
         // },
      };
      