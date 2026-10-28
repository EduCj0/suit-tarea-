# Suite de pruebas API + E2E · Eduardo Cortés Javier

Pruebas de software · Ingeniería en Software · Universidad Politécnica del Centro

| Capa | Sistema bajo prueba | Herramienta | Pruebas |
|---|---|---|---|
| API REST | [JSONPlaceholder](https://jsonplaceholder.typicode.com) | Playwright `request` + Ajv (JSON Schema) | 11 |
| E2E web | [SauceDemo](https://www.saucedemo.com) | Playwright (Chromium y Firefox, patrón Page Object) | 11 × 2 navegadores |
| CI/CD | GitHub Actions | Allure Report en GitHub Pages + resumen del job + webhook | en cada push |

## Ejecutar en tu computadora

```bash
npm ci
npx playwright install chromium firefox
npm test                 # toda la suite (33 pruebas)
npm run test:api         # solo API
npm run test:e2e         # solo E2E
npm run report:resumen   # genera reporte-ejecucion.md
npm run report:allure && npm run report:open   # reporte Allure (requiere Java 8+)
```

Variables opcionales: `API_URL`, `WEB_URL`, `SAUCE_USER`, `SAUCE_PASSWORD`, `MAX_RESPONSE_MS` (SLA, 1500 ms por defecto).

## Pipeline

`.github/workflows/pruebas.yml` se ejecuta en cada push, en cada pull request, manualmente y de lunes a viernes a las 06:17.

1. Instala dependencias, revisa tipos e instala navegadores.
2. Ejecuta la suite completa.
3. Escribe el reporte de ejecución en el resumen del job.
4. Genera Allure, conservando el historial de ejecuciones anteriores.
5. Guarda los reportes como artefactos y, en `main`, publica Allure en `https://<usuario>.github.io/<repo>/`.
6. Notifica el resultado en Slack o Discord, si existe el secreto `NOTIFY_WEBHOOK_URL`, y abre un issue cuando fallan las pruebas en `main`.

**Para activar GitHub Pages:** en Settings → Pages, elige la rama `gh-pages` (se crea después de la primera ejecución en `main`).

## Estructura

```
schemas/        JSON Schema de post, lista de posts y usuario
utils/          validación de esquemas y medición de tiempos
pages/          Page Objects de SauceDemo (login, inventario, checkout)
tests/api/      pruebas REST
tests/e2e/      pruebas de interfaz
scripts/        generador del reporte de ejecución
```
