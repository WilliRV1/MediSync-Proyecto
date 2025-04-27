// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/E2E/', // Directorio donde estarán tus pruebas E2E
  fullyParallel: true, // Ejecutar pruebas en paralelo
  /* Reintentar en CI solamente */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html', // Generar reportes HTML
  use: {
    /* URL base para acciones como `await page.goto('/')` */
    baseURL: 'http://localhost:5173', // ¡Asegúrate que sea el puerto correcto!

    /* Recolectar trazas en el primer reintento de una prueba fallida. */
    trace: 'on-first-retry',
  },

  /* Configurar proyectos para los navegadores principales */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Descomenta si quieres probar en otros navegadores
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Opcional: Configuración para iniciar tu servidor de desarrollo antes de las pruebas */
  webServer: {
     command: 'npm run dev', // Comando para iniciar tu app React
     url: 'http://localhost:5173', // URL a esperar antes de iniciar las pruebas
     reuseExistingServer: !process.env.CI, // Reusar servidor si ya está corriendo (localmente)
     stdout: 'pipe',
     stderr: 'pipe',
  },
});