import { type Page, type Locator, expect } from '@playwright/test';

export class InventoryPage {
  readonly titulo: Locator;
  readonly productos: Locator;
  readonly ordenar: Locator;
  readonly badgeCarrito: Locator;

  constructor(private readonly page: Page) {
    this.titulo = page.locator('[data-test="title"]');
    this.productos = page.locator('[data-test="inventory-item"]');
    this.ordenar = page.locator('[data-test="product-sort-container"]');
    this.badgeCarrito = page.locator('[data-test="shopping-cart-badge"]');
  }

  async estaCargada() {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.titulo).toHaveText('Products');
  }

  /** Agrega un producto por su nombre visible, p. ej. "Sauce Labs Backpack". */
  async agregar(nombre: string) {
    const id = nombre.toLowerCase().replace(/\s+/g, '-');
    await this.page.locator(`[data-test="add-to-cart-${id}"]`).click();
  }

  async precios(): Promise<number[]> {
    const textos = await this.page.locator('[data-test="inventory-item-price"]').allTextContents();
    return textos.map(t => Number(t.replace('$', '')));
  }

  async abrirDetalle(nombre: string) {
    await this.page.locator('[data-test="inventory-item-name"]', { hasText: nombre }).click();
  }

  async irAlCarrito() {
    await this.page.locator('[data-test="shopping-cart-link"]').click();
  }
}
