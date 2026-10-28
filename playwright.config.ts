import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de la suite.
 *  - Proyecto "api": pruebas REST contra JSONPlaceholder (sin navegador).
 *  - Proyectos "e2e-*": pruebas de interfaz contra SauceDemo en Chromium y Firefox.
 * Reportes: lista en consola, HTML de Playwright, JSON (para el resumen de ejecución) y Allure.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/resultados.json' }],
    ['allure-playwright', { resultsDir: 'allure-results', detail: true, suiteTitle: true,
      environmentInfo: { API: 'https://jsonplaceholder.typicode.com', WEB: 'https://www.saucedemo.com', Node: process.version } }],
  ],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: process.env.API_URL ?? 'https://jsonplaceholder.typicode.com',
             extraHTTPHeaders: { Accept: 'application/json' } },
    },
    {
      name: 'e2e-chromium',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Chrome'], baseURL: process.env.WEB_URL ?? 'https://www.saucedemo.com' },
    },
    {
      name: 'e2e-firefox',
      testDir: './tests/e2e',
      use: { ...devices['Desktop Firefox'], baseURL: process.env.WEB_URL ?? 'https://www.saucedemo.com' },
    },
  ],
});
