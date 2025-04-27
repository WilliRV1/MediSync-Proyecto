import { test, expect } from '@playwright/test';

test.describe('Login flow', () => {

  test('Login exitoso redirige al perfil', async ({ page }) => {
    await page.route('http://localhost:3001/api/login', async route => {
      const request = route.request();
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, user: { id: 1, name: 'Test User' } }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('http://localhost:5173/login'); 

    
    await page.getByPlaceholder('Correo electrónico o nombre de usuario').fill('testuser');

    
    await page.getByPlaceholder('Contraseña').fill('password123');

    
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    
    await expect(page).toHaveURL('http://localhost:5173/profile');
  });

  test('Login fallido muestra mensaje de error', async ({ page }) => {
    await page.route('http://localhost:3001/api/login', async route => {
      const request = route.request();
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'Credenciales inválidas' }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('http://localhost:5173/login');

    await page.getByPlaceholder('Correo electrónico o nombre de usuario').fill('wronguser');
    await page.getByPlaceholder('Contraseña').fill('wrongpassword');

    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    const errorMessage = await page.locator('text=Credenciales inválidas');
    await expect(errorMessage).toBeVisible();
  });

});