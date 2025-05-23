

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';
import '@testing-library/jest-dom';

describe('Input Component', () => {
  test('renderiza con placeholder correctamente', () => {
    render(<Input placeholder="Ingresa tu nombre" />);
    expect(screen.getByPlaceholderText('Ingresa tu nombre')).toBeInTheDocument();
  });

  test('acepta y muestra un valor inicial', () => {
    render(<Input value="Juan" onChange={() => {}} />);
    expect(screen.getByDisplayValue('Juan')).toBeInTheDocument();
  });

  test('dispara el evento onChange al escribir', () => {
    const handleChange = jest.fn();
    render(<Input value="" onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'nuevo valor' } });
    expect(handleChange).toHaveBeenCalled();
  });

  test('usa el tipo de input correcto', () => {
    render(<Input type="email" placeholder="correo" />);
    expect(screen.getByPlaceholderText('correo')).toHaveAttribute('type', 'email');
  });
});