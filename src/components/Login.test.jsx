const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import Login from './Login';

import '@testing-library/jest-dom';

import { MemoryRouter, useNavigate } from 'react-router-dom'; 


describe('Login Component', () => {



  test('renders login title', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    const titleElement = screen.getByRole('heading', { name: /¡Bienveni@!/i });
    expect(titleElement).toBeInTheDocument();
  });


  test('renders identifier input field', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    const identifierInput = screen.getByPlaceholderText(/Correo electrónico o nombre de usuario/i);
    expect(identifierInput).toBeInTheDocument();
    expect(identifierInput).toHaveAttribute('type', 'text');
  });

 
   test('renders password input field', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    const passwordInput = screen.getByPlaceholderText(/Contraseña/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password'); 
  });

  test('renders login button', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    const loginButton = screen.getByRole('button', { name: /Iniciar sesión/i });
    expect(loginButton).toBeInTheDocument();
  });



  // Test case 5: Allows user to type in identifier field
  test('allows typing in identifier field', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    const identifierInput = screen.getByPlaceholderText(/Correo electrónico o nombre de usuario/i);
    // Simula el evento 'change' como si el usuario escribiera
    fireEvent.change(identifierInput, { target: { value: 'testuser' } });
    // Verifica que el valor del input se haya actualizado
    expect(identifierInput).toHaveValue('testuser');
  });

  // Test case 6: Allows user to type in password field
  test('allows typing in password field', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    const passwordInput = screen.getByPlaceholderText(/Contraseña/i);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput).toHaveValue('password123');
  });

  // Test case 7: Toggles password visibility on eye icon click
  test('toggles password visibility', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    const passwordInput = screen.getByPlaceholderText(/Contraseña/i);
    // El botón/span que contiene el icono no tiene texto visible,
    // necesitamos una forma de seleccionarlo. Si el span tiene un 'role' o 'aria-label', úsalo.
    // Si no, podemos buscar el SVG directamente o añadir un 'data-testid' al span en Login.jsx
    // Asumiendo que el span es el único elemento con la clase 'toggle-password':

    const toggleButton = passwordInput.nextSibling;

    // Verifica que el input sea tipo 'password' inicialmente
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Simula clic en el botón/span del ojo
    fireEvent.click(toggleButton);

    // Verifica que el tipo del input haya cambiado a 'text'
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Simula otro clic para volver a ocultar
    fireEvent.click(toggleButton);

    // Verifica que el tipo del input sea 'password' nuevamente
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  

});


  test('muestra mensaje de éxito si existe en localStorage', () => {
    localStorage.setItem('successMessage', 'Bienvenido de nuevo');
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByText('Bienvenido de nuevo')).toBeInTheDocument();
    localStorage.removeItem('successMessage');
  });

  test('realiza login exitoso y navega al perfil', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/correo electrónico/i), {
      target: { value: 'usuario@correo.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/contraseña/i), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await screen.findByText('Entrando...', {}, { timeout: 2000 });

    expect(global.fetch).toHaveBeenCalledWith("http://localhost:3001/api/login", expect.any(Object));
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });
