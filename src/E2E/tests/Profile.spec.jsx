import { test, expect } from '@playwright/test';

test('Renderiza el perfil correctamente después del login', async ({ page }) => {
  // Ir a login y autenticarse
  await page.goto('http://localhost:5173/login');
  await page.getByPlaceholder('Correo electrónico').fill('velascopripra@gmail.com');
  await page.getByPlaceholder('Contraseña').fill('Autonoma12345.');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();

  // Esperar que se redirija al perfil
  await page.waitForURL('**/profile');

  // Verificar que el contenido del perfil esté presente
  await expect(page.getByRole('heading', { name: 'Perfil de Usuario' })).toBeVisible();
  await expect(page.getByText('Correo Electrónico:')).toBeVisible();
  await expect(page.getByText('Nombre de Usuario:')).toBeVisible();
});


test('Permite editar y guardar los datos del perfil', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.getByPlaceholder('Correo electrónico').fill('velascopripra@gmail.com');
  await page.getByPlaceholder('Contraseña').fill('Autonoma12345.');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await page.waitForURL('**/profile');

  // Click en "Editar Perfil"
  await page.getByRole('button', { name: 'Editar Perfil' }).click();

  // Modificar campos
  await page.getByLabel('Nombre:').fill('Juan modificado');
  await page.getByLabel('Teléfono:').fill('123456789');
  await page.getByLabel('Dirección:').fill('Dirección de prueba');

  // Guardar cambios
  await page.getByRole('button', { name: 'Guardar Cambios' }).click();

  // Verificar mensaje de éxito
  await expect(page.getByText('Perfil actualizado exitosamente.')).toBeVisible();

  // Verificar que los datos estén actualizados
  await expect(page.locator('span', { hasText: 'Juan modificado' })).toBeVisible();
});

test('Cierra sesión correctamente y redirige al login', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.getByPlaceholder('Correo electrónico').fill('velascopripra@gmail.com');
  await page.getByPlaceholder('Contraseña').fill('Autonoma12345.');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await page.waitForURL('**/profile');

  await page.getByRole('button', { name: 'Cerrar Sesión' }).click();

  // Esperar redirección
  await page.waitForURL('**/login');

  // Verificar que esté en el login
  await expect(page).toHaveURL('http://localhost:5173/login');
});

test('Muestra correctamente todos los campos del perfil', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.getByPlaceholder('Correo electrónico').fill('velascopripra@gmail.com');
  await page.getByPlaceholder('Contraseña').fill('Autonoma12345.');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await page.waitForURL('**/profile');

  await expect(page.getByText('Correo Electrónico:')).toBeVisible();
  await expect(page.getByText('Nombre de Usuario:')).toBeVisible();
  await expect(page.getByText('Rol:')).toBeVisible();
  await expect(page.getByText('Estado Cuenta:')).toBeVisible();
  await expect(page.getByText('Miembro desde:')).toBeVisible();
  await expect(page.getByText('Último Acceso:')).toBeVisible();
});
