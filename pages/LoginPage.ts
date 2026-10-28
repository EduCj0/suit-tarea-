import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly usuario: Locator;
  readonly password: Locator;
  readonly boton: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.usuario = page.locator('[data-test="username"]');
    this.password = page.locator('[data-test="password"]');
    this.boton = page.locator('[data-test="login-button"]');
    this.error = page.locator('[data-test="error"]');
  }

  async abrir() {
    await this.page.goto('/');
    await expect(this.boton).toBeVisible();
  }

  async ingresar(usuario: string, password: string) {
    await this.usuario.fill(usuario);
    await this.password.fill(password);
    await this.boton.click();
  }
}
