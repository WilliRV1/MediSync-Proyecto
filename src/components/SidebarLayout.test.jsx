

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SidebarLayout from './SidebarLayout';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

describe('SidebarLayout Component', () => {
  test('renderiza el título y enlaces del sidebar', () => {
    render(
      <MemoryRouter>
        <SidebarLayout />
      </MemoryRouter>
    );

    expect(screen.getAllByText('MiCuenta')[0]).toBeInTheDocument();
    expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
    expect(screen.getByText(/registrarse/i)).toBeInTheDocument();
    expect(screen.getByText(/recuperar contraseña/i)).toBeInTheDocument();
    expect(screen.getByText(/perfil/i)).toBeInTheDocument();
  });

  test('alternar sidebar con el botón de Navbar', () => {
    render(
      <MemoryRouter>
        <SidebarLayout />
      </MemoryRouter>
    );

    const toggleBtn = screen.getByRole('button');
    const sidebar = screen.getByRole('complementary');

    // Asegura que inicialmente esté cerrado
    expect(sidebar.classList.contains('closed')).toBe(true);

    // Click para abrir
    fireEvent.click(toggleBtn);
    expect(sidebar.classList.contains('open')).toBe(true);

    // Click para cerrar
    fireEvent.click(toggleBtn);
    expect(sidebar.classList.contains('closed')).toBe(true);
  });
});