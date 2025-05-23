

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';
import '@testing-library/jest-dom';

describe('Button Component', () => {
  test('renderiza el texto correctamente', () => {
    render(<Button>Enviar</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Enviar');
  });

  test('dispara el evento onClick cuando se hace clic', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clic aquí</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('aplica clases adicionales correctamente', () => {
    render(<Button className="custom-class">Botón</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  test('usa el tipo de botón correcto', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});