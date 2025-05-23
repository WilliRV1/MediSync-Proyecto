import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPassword from './ForgotPassword';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

describe('Flujo completo de ForgotPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test('renderiza correctamente el paso 1', () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /recuperar contraseña/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Correo electrónico o nombre de usuario')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument();
  });

  test('simula envío de correo válido y avanza al paso 2', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, credentialId: '123' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, question: '¿Tu color favorito?' }),
      });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico o nombre de usuario'), {
      target: { value: 'test@correo.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    await waitFor(() => {
      expect(screen.getByText(/¿tu color favorito\?/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Tu respuesta secreta')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /verificar respuesta/i })).toBeInTheDocument();
    });
  });

  test('responde correctamente la pregunta y avanza al paso 3', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, credentialId: '123' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, question: '¿Tu color favorito?' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Correo electrónico o nombre de usuario'), {
      target: { value: 'test@correo.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    await screen.findByPlaceholderText('Tu respuesta secreta');

    fireEvent.change(screen.getByPlaceholderText('Tu respuesta secreta'), {
      target: { value: 'Azul' },
    });

    fireEvent.click(screen.getByRole('button', { name: /verificar respuesta/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nueva contraseña (mín. 6 caracteres)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirmar nueva contraseña')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /actualizar contraseña/i })).toBeInTheDocument();
    });
  });

  test('permite cambiar la contraseña con éxito', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, credentialId: '123' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, question: '¿Tu color favorito?' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    // Paso 1
    fireEvent.change(screen.getByPlaceholderText('Correo electrónico o nombre de usuario'), {
      target: { value: 'test@correo.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    await screen.findByText(/¿tu color favorito\?/i);

    // Paso 2
    fireEvent.change(screen.getByPlaceholderText('Tu respuesta secreta'), {
      target: { value: 'Azul' },
    });

    fireEvent.click(screen.getByRole('button', { name: /verificar respuesta/i }));

    await screen.findByPlaceholderText('Nueva contraseña (mín. 6 caracteres)');

    // Paso 3
    fireEvent.change(screen.getByPlaceholderText('Nueva contraseña (mín. 6 caracteres)'), {
      target: { value: 'Nueva1234' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirmar nueva contraseña'), {
      target: { value: 'Nueva1234' },
    });
    fireEvent.click(screen.getByRole('button', { name: /actualizar contraseña/i }));

    await waitFor(() => {
      expect(screen.getByText(/contraseña actualizada/i)).toBeInTheDocument();
    });
  });
});