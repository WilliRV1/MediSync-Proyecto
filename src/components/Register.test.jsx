import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, message: 'Mocked success' }),
  })
);

describe('Register Component', () => {
  beforeEach(() => {
    mockedNavigate.mockClear();
    global.fetch.mockClear();
  });

  test('renders registration form correctly', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('Nombre completo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nombre de usuario')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña (mín. 6 caracteres)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirmar contraseña')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Pregunta de seguridad (ej: nombre de mascota)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Respuesta de seguridad')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear cuenta/i })).toBeInTheDocument();
  });

  test('allows typing in form fields', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const nameInput = screen.getByPlaceholderText('Nombre completo');
    const usernameInput = screen.getByPlaceholderText('Nombre de usuario');
    const emailInput = screen.getByPlaceholderText('Correo electrónico');
    const passwordInput = screen.getByPlaceholderText('Contraseña (mín. 6 caracteres)');

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(nameInput).toHaveValue('Test User');
    expect(usernameInput).toHaveValue('testuser');
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('calls fetch on successful submit with valid data', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Nombre completo'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('Nombre de usuario'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña (mín. 6 caracteres)'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirmar contraseña'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Pregunta de seguridad (ej: nombre de mascota)'), { target: { value: 'Pet name?' } });
    fireEvent.change(screen.getByPlaceholderText('Respuesta de seguridad'), { target: { value: 'Fido' } });

    const submitButton = screen.getByRole('button', { name: /Crear cuenta/i });
    fireEvent.click(submitButton);

    await screen.findByText(/¡Registro exitoso!/i);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/register',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: 'Test User',
          username: 'testuser',
          correo: 'test@example.com',
          password: 'password123',
          preguntaSeguridad: 'Pet name?',
          respuestaSeguridad: 'Fido',
        }),
      })
    );
  });

});

  test('muestra error si las contraseñas no coinciden', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Nombre completo'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('Nombre de usuario'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña (mín. 6 caracteres)'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirmar contraseña'), { target: { value: 'differentPassword' } });
    fireEvent.change(screen.getByPlaceholderText('Pregunta de seguridad (ej: nombre de mascota)'), { target: { value: 'Pet name?' } });
    fireEvent.change(screen.getByPlaceholderText('Respuesta de seguridad'), { target: { value: 'Fido' } });

    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }));

    expect(await screen.findByText(/Las contraseñas no coinciden/i)).toBeInTheDocument();
  });

  test('muestra error si la contraseña es demasiado corta', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Nombre completo'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('Nombre de usuario'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña (mín. 6 caracteres)'), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirmar contraseña'), { target: { value: '123' } });
    fireEvent.change(screen.getByPlaceholderText('Pregunta de seguridad (ej: nombre de mascota)'), { target: { value: 'Pet name?' } });
    fireEvent.change(screen.getByPlaceholderText('Respuesta de seguridad'), { target: { value: 'Fido' } });

    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }));

    expect(await screen.findByText(/La contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
  });

  test('muestra mensaje de error en fallo del servidor', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Error del servidor' }),
      })
    );

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Nombre completo'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('Nombre de usuario'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña (mín. 6 caracteres)'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirmar contraseña'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Pregunta de seguridad (ej: nombre de mascota)'), { target: { value: 'Pet name?' } });
    fireEvent.change(screen.getByPlaceholderText('Respuesta de seguridad'), { target: { value: 'Fido' } });

    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }));

    expect(await screen.findByText(/Error del servidor/i)).toBeInTheDocument();
  });