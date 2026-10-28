import { test, expect, USUARIO, PASSWORD } from './fixtures';

test.describe('E2E - Login', () => {
  test('E2E-01 login exitoso con usuario estándar @smoke', async ({ login, inventario }) => {
    await login.abrir();
    await login.ingresar(USUARIO, PASSWORD);
    await inventario.estaCargada();
    await expect(inventario.productos).toHaveCount(6);
  });

  test('E2E-02 contraseña incorrecta muestra error y no permite el acceso', async ({ page, login }) => {
    await login.abrir();
    await login.ingresar(USUARIO, 'incorrecta');
    await expect(login.error).toContainText('Username and password do not match');
    await expect(page).not.toHaveURL(/inventory/);
  });

  test('E2E-03 usuario bloqueado recibe mensaje de bloqueo', async ({ login }) => {
    await login.abrir();
    await login.ingresar('locked_out_user', PASSWORD);
    await expect(login.error).toContainText('Sorry, this user has been locked out');
  });

  test('E2E-04 campos vacíos exigen el usuario', async ({ login }) => {
    await login.abrir();
    await login.boton.click();
    await expect(login.error).toContainText('Username is required');
  });

  test('E2E-05 no se puede abrir el inventario sin sesión', async ({ page }) => {
    await page.goto('/inventory.html');
    await expect(page.locator('[data-test="error"]')).toContainText("You can only access '/inventory.html' when you are logged in");
  });
});
