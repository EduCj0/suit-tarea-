import { test as base } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';
import { CheckoutPage } from '../../pages/CheckoutPage';

export const USUARIO = process.env.SAUCE_USER ?? 'standard_user';
export const PASSWORD = process.env.SAUCE_PASSWORD ?? 'secret_sauce';   // credencial pública del sitio demo

type Paginas = { login: LoginPage; inventario: InventoryPage; checkout: CheckoutPage; sesionIniciada: InventoryPage };

export const test = base.extend<Paginas>({
  login: async ({ page }, use) => use(new LoginPage(page)),
  inventario: async ({ page }, use) => use(new InventoryPage(page)),
  checkout: async ({ page }, use) => use(new CheckoutPage(page)),
  /** Deja la sesión iniciada con el usuario estándar antes de la prueba. */
  sesionIniciada: async ({ page, login }, use) => {
    await login.abrir();
    await login.ingresar(USUARIO, PASSWORD);
    const inv = new InventoryPage(page);
    await inv.estaCargada();
    await use(inv);
  },
});
export { expect } from '@playwright/test';
