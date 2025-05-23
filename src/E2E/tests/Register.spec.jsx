import { test, expect } from '@playwright/test';

test.describe('Register flow', () => {

  test('Registro exitoso redirige al login', async ({ page }) => {
    await page.route('http://localhost:3001/api/register', async route => {
      const request = route.request();
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('http://localhost:5173/register'); 

    // Completar formulario de registro
    await page.getByPlaceholder('Nombre completo').fill('John Doe');
    await page.getByPlaceholder('Nombre de usuario').fill('johndoe123');
    await page.getByPlaceholder('Correo electrónico').fill('johndoe@example.com');
    await page.getByPlaceholder('Contraseña (mín. 6 caracteres)').fill('password123');
    await page.getByPlaceholder('Confirmar contraseña').fill('password123');
    await page.getByPlaceholder('Pregunta de seguridad (ej: nombre de mascota)').fill('¿Nombre de tu primera mascota?');
    await page.getByPlaceholder('Respuesta de seguridad').fill('Fluffy');

    // Hacer clic en el botón de registro
    await page.getByRole('button', { name: 'Crear cuenta' }).click();

    // Verificar que la URL haya cambiado al login
    await expect(page).toHaveURL('http://localhost:5173/login');
  });

  test('Registro fallido muestra mensaje de error', async ({ page }) => {
    await page.route('http://localhost:3001/api/register', async route => {
      const request = route.request();
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'Error en el registro. Intenta de nuevo.' }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('http://localhost:5173/register');

    // Completar formulario de registro con datos incorrectos
    await page.getByPlaceholder('Nombre completo').fill('John Doe');
    await page.getByPlaceholder('Nombre de usuario').fill('johndoe123');
    await page.getByPlaceholder('Correo electrónico').fill('johndoe@example.com');
    await page.getByPlaceholder('Contraseña (mín. 6 caracteres)').fill('password123');
    await page.getByPlaceholder('Confirmar contraseña').fill('password123');
    await page.getByPlaceholder('Pregunta de seguridad (ej: nombre de mascota)').fill('¿Nombre de tu primera mascota?');
    await page.getByPlaceholder('Respuesta de seguridad').fill('Fluffy');

    // Hacer clic en el botón de registro
    await page.getByRole('button', { name: 'Crear cuenta' }).click();

    // Verificar que el mensaje de error se muestra
    const errorMessage = await page.locator('text=Error en el registro. Intenta de nuevo.');
    await expect(errorMessage).toBeVisible();
  });

});
