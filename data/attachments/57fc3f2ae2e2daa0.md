# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/navegacion.spec.ts >> E2E - Navegación >> E2E-07 abrir el detalle de un producto y regresar
- Location: tests/e2e/navegacion.spec.ts:10:7

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: locator('[data-test="inventory-item-name"]')
Expected: "Sauce Labs Bolt T-Shirt"
Error: strict mode violation: locator('[data-test="inventory-item-name"]') resolved to 6 elements:
    1) <div class="inventory_item_name " data-test="inventory-item-name">Sauce Labs Backpack</div> aka locator('[data-test="item-4-title-link"]')
    2) <div class="inventory_item_name " data-test="inventory-item-name">Sauce Labs Bike Light</div> aka locator('[data-test="item-0-title-link"]')
    3) <div class="inventory_item_name " data-test="inventory-item-name">Sauce Labs Bolt T-Shirt</div> aka locator('[data-test="item-1-title-link"]')
    4) <div class="inventory_item_name " data-test="inventory-item-name">Sauce Labs Fleece Jacket</div> aka locator('[data-test="item-5-title-link"]')
    5) <div class="inventory_item_name " data-test="inventory-item-name">Sauce Labs Onesie</div> aka locator('[data-test="item-2-title-link"]')
    6) <div class="inventory_item_name " data-test="inventory-item-name">Test.allTheThings() T-Shirt (Red)</div> aka locator('[data-test="item-3-title-link"]')

Call log:
  - Expect "toHaveText" locator('[data-test="inventory-item-name"]') with timeout 7000ms
  - waiting for locator('[data-test="inventory-item-name"]')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]:
          - button "Open Menu" [ref=e8] [cursor=pointer]
          - img "Open Menu" [ref=e9]
        - generic [ref=e10]: Swag Labs
        - button "Cart, empty" [ref=e13]
      - button "Back to products" [ref=e16] [cursor=pointer]
    - main [ref=e17]:
      - generic [ref=e19]:
        - img "Sauce Labs Bolt T-Shirt" [ref=e21]
        - generic [ref=e22]:
          - generic [ref=e23]: Sauce Labs Bolt T-Shirt
          - generic [ref=e24]: Get your testing superhero on with the Sauce Labs bolt T-shirt. From American Apparel, 100% ringspun combed cotton, heather gray with red bolt.
          - generic [ref=e25]: $15.99
          - button "Add to cart" [ref=e26] [cursor=pointer]
  - contentinfo [ref=e27]:
    - list [ref=e28]:
      - listitem [ref=e29]:
        - link "X" [ref=e30] [cursor=pointer]:
          - /url: https://x.com/saucelabs
      - listitem [ref=e31]:
        - link "Facebook" [ref=e32] [cursor=pointer]:
          - /url: https://www.facebook.com/saucelabs
      - listitem [ref=e33]:
        - link "LinkedIn" [ref=e34] [cursor=pointer]:
          - /url: https://www.linkedin.com/company/sauce-labs/
    - generic [ref=e35]: © 2026 Sauce Labs. All Rights Reserved. Terms of Service | Privacy Policy
```

# Test source

```ts
  1  | import { test, expect } from './fixtures';
  2  | 
  3  | test.describe('E2E - Navegación', () => {
  4  |   test('E2E-06 ordenar por precio de menor a mayor', async ({ sesionIniciada }) => {
  5  |     await sesionIniciada.ordenar.selectOption('lohi');
  6  |     const precios = await sesionIniciada.precios();
  7  |     expect(precios).toEqual([...precios].sort((a, b) => a - b));
  8  |   });
  9  | 
  10 |   test('E2E-07 abrir el detalle de un producto y regresar', async ({ page, sesionIniciada }) => {
  11 |     await sesionIniciada.abrirDetalle('Sauce Labs Bolt T-Shirt');
  12 |     // Esperar a que cargue la ficha: en el inventario hay 6 elementos con el mismo data-test
  13 |     // y la verificación fallaba por "strict mode" si se ejecutaba antes de la navegación.
  14 |     await expect(page).toHaveURL(/inventory-item\.html\?id=\d+/);
> 15 |     await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Bolt T-Shirt');
     |                                                                     ^ Error: expect(locator).toHaveText(expected) failed
  16 |     await page.locator('[data-test="back-to-products"]').click();
  17 |     await sesionIniciada.estaCargada();
  18 |   });
  19 | 
  20 |   test('E2E-08 el menú lateral permite cerrar sesión', async ({ page, sesionIniciada }) => {
  21 |     await expect(sesionIniciada.productos).toHaveCount(6);
  22 |     await page.getByRole('button', { name: 'Open Menu' }).click();
  23 |     await page.locator('[data-test="logout-sidebar-link"]').click();
  24 |     await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  25 |   });
  26 | });
  27 | 
```