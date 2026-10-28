import { type Page, type Locator, expect } from '@playwright/test';

export class CheckoutPage {
  readonly itemsCarrito: Locator;
  readonly subtotal: Locator;
  readonly impuesto: Locator;
  readonly total: Locator;
  readonly mensajeFinal: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.itemsCarrito = page.locator('[data-test="inventory-item"]');
    this.subtotal = page.locator('[data-test="subtotal-label"]');
    this.impuesto = page.locator('[data-test="tax-label"]');
    this.total = page.locator('[data-test="total-label"]');
    this.mensajeFinal = page.locator('[data-test="complete-header"]');
    this.error = page.locator('[data-test="error"]');
  }

  async iniciar() {
    await this.page.locator('[data-test="checkout"]').click();
    await expect(this.page).toHaveURL(/checkout-step-one/);
  }

  async llenarDatos(nombre: string, apellido: string, cp: string) {
    await this.page.locator('[data-test="firstName"]').fill(nombre);
    await this.page.locator('[data-test="lastName"]').fill(apellido);
    await this.page.locator('[data-test="postalCode"]').fill(cp);
    await this.page.locator('[data-test="continue"]').click();
  }

  async finalizar() {
    await this.page.locator('[data-test="finish"]').click();
  }

  /** Extrae el número de una etiqueta como "Item total: $39.98". */
  static monto(texto: string | null): number {
    return Number((texto ?? '').replace(/[^0-9.]/g, ''));
  }
}
