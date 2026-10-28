import { test, expect } from './fixtures';
import { CheckoutPage } from '../../pages/CheckoutPage';

const PRODUCTOS = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];

test.describe('E2E - Checkout', () => {
  test('E2E-09 compra completa de dos productos con totales correctos @smoke', async ({ page, sesionIniciada, checkout }) => {
    for (const p of PRODUCTOS) await sesionIniciada.agregar(p);
    await expect(sesionIniciada.badgeCarrito).toHaveText('2');

    await sesionIniciada.irAlCarrito();
    await expect(checkout.itemsCarrito).toHaveCount(2);

    await checkout.iniciar();
    await checkout.llenarDatos('Eduardo', 'Cortés', '86000');
    await expect(page).toHaveURL(/checkout-step-two/);

    const subtotal = CheckoutPage.monto(await checkout.subtotal.textContent());
    const impuesto = CheckoutPage.monto(await checkout.impuesto.textContent());
    const total = CheckoutPage.monto(await checkout.total.textContent());
    expect(subtotal).toBeCloseTo(29.99 + 9.99, 2);
    expect(total).toBeCloseTo(subtotal + impuesto, 2);

    await checkout.finalizar();
    await expect(checkout.mensajeFinal).toHaveText('Thank you for your order!');
    await expect(sesionIniciada.badgeCarrito).toHaveCount(0);
  });

  test('E2E-10 el checkout exige el código postal', async ({ sesionIniciada, checkout }) => {
    await sesionIniciada.agregar('Sauce Labs Onesie');
    await sesionIniciada.irAlCarrito();
    await checkout.iniciar();
    await checkout.llenarDatos('Eduardo', 'Cortés', '');
    await expect(checkout.error).toContainText('Postal Code is required');
  });

  test('E2E-11 quitar un producto del carrito actualiza el contador', async ({ page, sesionIniciada }) => {
    for (const p of PRODUCTOS) await sesionIniciada.agregar(p);
    await sesionIniciada.irAlCarrito();
    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();
    await expect(sesionIniciada.badgeCarrito).toHaveText('1');
  });
});
