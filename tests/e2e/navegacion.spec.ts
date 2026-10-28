import { test, expect } from './fixtures';

test.describe('E2E - Navegación', () => {
  test('E2E-06 ordenar por precio de menor a mayor', async ({ sesionIniciada }) => {
    await sesionIniciada.ordenar.selectOption('lohi');
    const precios = await sesionIniciada.precios();
    expect(precios).toEqual([...precios].sort((a, b) => a - b));
  });

  test('E2E-07 abrir el detalle de un producto y regresar', async ({ page, sesionIniciada }) => {
    await sesionIniciada.abrirDetalle('Sauce Labs Bolt T-Shirt');
    // Esperar a que cargue la ficha: en el inventario hay 6 elementos con el mismo data-test
    // y la verificación fallaba por "strict mode" si se ejecutaba antes de la navegación.
    await expect(page).toHaveURL(/inventory-item\.html\?id=\d+/);
    await expect(page.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Bolt T-Shirt');
    await page.locator('[data-test="back-to-products"]').click();
    await sesionIniciada.estaCargada();
  });

  test('E2E-08 el menú lateral permite cerrar sesión', async ({ page, sesionIniciada }) => {
    await expect(sesionIniciada.productos).toHaveCount(6);
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.locator('[data-test="logout-sidebar-link"]').click();
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });
});
