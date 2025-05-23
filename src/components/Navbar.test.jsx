

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from './Navbar';
import '@testing-library/jest-dom';

describe('Navbar Component', () => {
  test('renderiza correctamente el título y logo', () => {
    render(<Navbar toggleSidebar={() => {}} isSidebarOpen={false} />);

    expect(screen.getByText('MiCuenta')).toBeInTheDocument();
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
  });

  test('muestra icono ☰ cuando sidebar está cerrado', () => {
    render(<Navbar toggleSidebar={() => {}} isSidebarOpen={false} />);
    expect(screen.getByRole('button')).toHaveTextContent('☰');
  });

  test('muestra icono ✖ cuando sidebar está abierto', () => {
    render(<Navbar toggleSidebar={() => {}} isSidebarOpen={true} />);
    expect(screen.getByRole('button')).toHaveTextContent('✖');
  });

  test('ejecuta toggleSidebar al hacer click en botón', () => {
    const mockToggle = jest.fn();
    render(<Navbar toggleSidebar={mockToggle} isSidebarOpen={false} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockToggle).toHaveBeenCalled();
  });
});