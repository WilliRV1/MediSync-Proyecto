import { test, expect } from '@playwright/test';

test.describe('Profile flow', () => {

  test('Verificación de perfil cargado correctamente', async ({ page }) => {
    // Simulamos la respuesta de la API de perfil
    await page.route('http://localhost:3001/api/profile/me', async route => {
      const request = route.request();
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: { 
              id: 1, 
              nombre: 'Juan Perez',
              apellido: 'Perez',
              email: 'juan.perez@example.com',
              telefono: '123456789',
              nombre_usuario: 'jperez',
              tipo_usuario: 'Paciente',
              estado: 'Activa'
            }
          }),
        });
      } else {
        route.continue();
      }
    });

    // Ir a la página de perfil
    await page.goto('http://localhost:5173/profile'); 

    // Verificamos que los datos del perfil se muestran correctamente
    await expect(page.locator('text=Juan Perez')).toBeVisible();
    await expect(page.locator('text=juan.perez@example.com')).toBeVisible();
    await expect(page.locator('text=jperez')).toBeVisible();
    await expect(page.locator('text=Paciente')).toBeVisible();
    await expect(page.locator('text=Activa')).toBeVisible();
  });

  test('Edición del perfil', async ({ page }) => {
    // Simulamos la respuesta de la API para obtener los datos del perfil
    await page.route('http://localhost:3001/api/profile/me', async route => {
      const request = route.request();
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: { 
              id: 1, 
              nombre: 'Juan Perez',
              apellido: 'Perez',
              email: 'juan.perez@example.com',
              telefono: '123456789',
              nombre_usuario: 'jperez',
              tipo_usuario: 'Paciente',
              estado: 'Activa'
            }
          }),
        });
      } else {
        route.continue();
      }
    });

    // Ir a la página de perfil
    await page.goto('http://localhost:5173/profile'); 

    // Hacer clic en el botón de "Editar Perfil"
    await page.getByRole('button', { name: 'Editar Perfil' }).click();

    // Rellenar los campos de edición
    await page.getByPlaceholder('Nombre').fill('Juan Modificado');
    await page.getByPlaceholder('Teléfono').fill('987654321');

    // Simular el guardado de cambios (llamada de API PUT)
    await page.route('http://localhost:3001/api/profile/me', async route => {
      const request = route.request();
      if (request.method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: { 
              id: 1, 
              nombre: 'Juan Modificado',
              apellido: 'Perez',
              email: 'juan.perez@example.com',
              telefono: '987654321',
              nombre_usuario: 'jperez',
              tipo_usuario: 'Paciente',
              estado: 'Activa'
            }
          }),
        });
      } else {
        route.continue();
      }
    });

    // Hacer clic en el botón de "Guardar Cambios"
    await page.getByRole('button', { name: 'Guardar Cambios' }).click();

    // Verificar que los datos actualizados se muestran en el perfil
    await expect(page.locator('text=Juan Modificado')).toBeVisible();
    await expect(page.locator('text=987654321')).toBeVisible();
  });

  test('Cierre de sesión desde el perfil', async ({ page }) => {
    // Simulamos la respuesta de la API de perfil
    await page.route('http://localhost:3001/api/profile/me', async route => {
      const request = route.request();
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: { 
              id: 1, 
              nombre: 'Juan Perez',
              apellido: 'Perez',
              email: 'juan.perez@example.com',
              telefono: '123456789',
              nombre_usuario: 'jperez',
              tipo_usuario: 'Paciente',
              estado: 'Activa'
            }
          }),
        });
      } else {
        route.continue();
      }
    });

    // Ir a la página de perfil
    await page.goto('http://localhost:5173/profile');

    // Simulamos la respuesta de la API de cierre de sesión
    await page.route('http://localhost:3001/api/logout', async route => {
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

    // Hacer clic en el botón de "Cerrar sesión"
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();

    // Verificar que la URL cambie a la página de login
    await expect(page).toHaveURL('http://localhost:5173/login');
  });

});