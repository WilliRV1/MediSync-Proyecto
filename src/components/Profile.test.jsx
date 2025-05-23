import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Profile from './Profile';

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

global.confirm = jest.fn(() => true);

const mockUserData = {
  id: 'user123',
  nombre: 'Juan',
  apellido: 'Perez',
  correo: 'juan.perez@example.com',
  username: 'jperez',
  fechaNacimiento: '1990-05-15T00:00:00.000Z',
  telefono: '123456789',
  direccion: 'Calle Falsa 123',
  rol: 'Paciente',
  estadoCuenta: 'Activa',
  createdAt: new Date().toISOString(),
  ultimoAcceso: new Date().toISOString(),
};

describe('Profile Component Functional Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    mockedNavigate.mockClear();
    global.confirm.mockClear();
    global.fetch = jest.fn();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, user: mockUserData }),
    });
  });

  it('should render profile data correctly', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    expect(await screen.findByText(mockUserData.nombre)).toBeInTheDocument();
    expect(screen.getByText(mockUserData.apellido)).toBeInTheDocument();
    expect(screen.getByText(mockUserData.correo)).toBeInTheDocument();
    expect(screen.getByText(mockUserData.username)).toBeInTheDocument();
    expect(screen.getByText(mockUserData.rol)).toBeInTheDocument();
    expect(screen.getByText(mockUserData.estadoCuenta)).toBeInTheDocument();
  });

  it('should enter edit mode when "Editar Perfil" is clicked', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    await screen.findByText(mockUserData.nombre);

    fireEvent.click(screen.getByRole('button', { name: /Editar Perfil/i }));

    expect(screen.getByDisplayValue(mockUserData.nombre)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar Cambios/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
  });

  it('should save updated profile data and exit edit mode', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    await screen.findByText(mockUserData.nombre);

    fireEvent.click(screen.getByRole('button', { name: /Editar Perfil/i }));

    const nombreInput = screen.getByDisplayValue(mockUserData.nombre);
    const telefonoInput = screen.getByDisplayValue(mockUserData.telefono);

    fireEvent.change(nombreInput, { target: { value: 'Juan Modificado' } });
    fireEvent.change(telefonoInput, { target: { value: '987654321' } });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          message: 'Perfil actualizado',
          user: { ...mockUserData, nombre: 'Juan Modificado', telefono: '987654321' },
        }),
    });

    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

    await waitFor(() => {
      expect(screen.getByText(/Perfil actualizado exitosamente/i)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/profile/me',
      expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: 'Juan Modificado',
          apellido: mockUserData.apellido,
          fechaNacimiento: new Date(mockUserData.fechaNacimiento).toISOString().slice(0, 10),
          telefono: '987654321',
          direccion: mockUserData.direccion,
        }),
      })
    );

    expect(screen.queryByRole('button', { name: /Guardar Cambios/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Editar Perfil/i })).toBeInTheDocument();
    expect(screen.getByText('Juan Modificado')).toBeInTheDocument();
    expect(screen.getByText('987654321')).toBeInTheDocument();
  });

  it('should call logout API and navigate on "Cerrar Sesión"', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    await screen.findByText(mockUserData.nombre);

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, message: 'Logout exitoso' }),
    });

    fireEvent.click(screen.getByRole('button', { name: /Cerrar Sesión/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/logout',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('should call delete API and confirm before deleting account', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    await screen.findByText(mockUserData.nombre);

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, message: 'Cuenta eliminada' }),
    });

    fireEvent.click(screen.getByRole('button', { name: /Eliminar Cuenta/i }));

    expect(global.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/profile/me',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});

it('debe mostrar mensaje de error si falla la carga del perfil', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: false,
    status: 500,
    json: () => Promise.resolve({ message: 'Error del servidor' }),
  });

  render(
    <BrowserRouter>
      <Profile />
    </BrowserRouter>
  );

  await waitFor(() => {
    expect(screen.getByText(/Error al cargar perfil/i)).toBeInTheDocument();
  });
});

it('debe mostrar mensaje de error si falla la actualización del perfil', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ success: true, user: mockUserData }),
  });

  render(
    <BrowserRouter>
      <Profile />
    </BrowserRouter>
  );

  await screen.findByText(mockUserData.nombre);
  fireEvent.click(screen.getByRole('button', { name: /Editar Perfil/i }));

  global.fetch.mockResolvedValueOnce({
    ok: false,
    status: 500,
    json: () => Promise.resolve({ message: 'Error al actualizar' }),
  });

  fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));

  await waitFor(() => {
    expect(screen.getByText(/Error al actualizar/i)).toBeInTheDocument();
  });
});

it('debe mostrar mensaje de error si falla el logout', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ success: true, user: mockUserData }),
  });

  render(
    <BrowserRouter>
      <Profile />
    </BrowserRouter>
  );

  await screen.findByText(mockUserData.nombre);

  global.fetch.mockResolvedValueOnce({
    ok: false,
    status: 500,
    json: () => Promise.resolve({ message: 'Error al cerrar sesión' }),
  });

  fireEvent.click(screen.getByRole('button', { name: /Cerrar Sesión/i }));

  await waitFor(() => {
    expect(screen.getByText(/Error al cerrar sesión/i)).toBeInTheDocument();
  });
});

it('debe mostrar mensaje de error si falla la eliminación de cuenta', async () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ success: true, user: mockUserData }),
  });

  render(
    <BrowserRouter>
      <Profile />
    </BrowserRouter>
  );

  await screen.findByText(mockUserData.nombre);

  global.fetch.mockResolvedValueOnce({
    ok: false,
    status: 500,
    json: () => Promise.resolve({ message: 'Error al eliminar' }),
  });

  fireEvent.click(screen.getByRole('button', { name: /Eliminar Cuenta/i }));

  await waitFor(() => {
    expect(screen.getByText(/Error al eliminar/i)).toBeInTheDocument();
  });
});