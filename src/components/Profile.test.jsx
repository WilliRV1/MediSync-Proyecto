import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Profile from './Profile';

// Mock de useNavigate
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

describe('Profile Component', () => {
  beforeEach(() => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    mockedNavigate.mockClear();
    global.confirm.mockClear();
    global.fetch = jest.fn(); 

    // Mock inicial para la carga del perfil (GET /api/profile/me)
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, user: mockUserData }),
    });
  });

  test('renders profile data correctly after loading', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    // Espera a que los datos se carguen y aparezcan en pantalla
    expect(await screen.findByText(mockUserData.nombre)).toBeInTheDocument();
    expect(screen.getByText(mockUserData.apellido)).toBeInTheDocument();
    expect(screen.getByText(mockUserData.correo)).toBeInTheDocument();
    expect(screen.getByText(mockUserData.username)).toBeInTheDocument();
    expect(screen.getByText(mockUserData.rol)).toBeInTheDocument();
    expect(screen.getByText(mockUserData.estadoCuenta)).toBeInTheDocument();
    // Verificar la presencia de botones clave
    expect(screen.getByRole('button', { name: /Editar Perfil/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cerrar Sesión/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Eliminar Cuenta/i })).toBeInTheDocument();
  });

  test('toggles edit mode when "Editar Perfil" is clicked', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    // Espera a que carguen los datos iniciales
    await screen.findByText(mockUserData.nombre);

    const editButton = screen.getByRole('button', { name: /Editar Perfil/i });
    fireEvent.click(editButton);

    // Verifica que aparezcan los inputs y los botones de guardar/cancelar
    expect(screen.getByDisplayValue(mockUserData.nombre)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUserData.apellido)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar Cambios/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Editar Perfil/i })).not.toBeInTheDocument(); // El botón Editar desaparece
  });

 test('allows changing data in edit mode and calls update API on save', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
    await screen.findByText(mockUserData.nombre); // Espera carga inicial

    // Entra en modo edición
    fireEvent.click(screen.getByRole('button', { name: /Editar Perfil/i }));

    // Modifica el nombre y el teléfono
    const nombreInput = screen.getByDisplayValue(mockUserData.nombre);
    const telefonoInput = screen.getByDisplayValue(mockUserData.telefono);
    fireEvent.change(nombreInput, { target: { value: 'Juan Modificado' } });
    fireEvent.change(telefonoInput, { target: { value: '987654321' } });

    // Prepara el mock para la llamada PUT de actualización
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        message: 'Perfil actualizado',
        // Devuelve los datos actualizados (simulado)
        user: { ...mockUserData, nombre: 'Juan Modificado', telefono: '987654321' },
      }),
    });

    // Click en Guardar Cambios
    const saveButton = screen.getByRole('button', { name: /Guardar Cambios/i });
    fireEvent.click(saveButton);

    // Espera a que se muestre el mensaje de éxito y que la API haya sido llamada
    await screen.findByText(/Perfil actualizado exitosamente/i);

    // Verifica que la API PUT fue llamada correctamente
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/profile/me',
      expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: 'Juan Modificado',
          apellido: mockUserData.apellido, // Este no se cambió
          fechaNacimiento: '1990-05-15', // Formato YYYY-MM-DD que usa el componente
          telefono: '987654321',
          direccion: mockUserData.direccion, // Este no se cambió
        }),
      })
    );

     // Verifica que sale del modo edición
    expect(screen.queryByRole('button', { name: /Guardar Cambios/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Editar Perfil/i })).toBeInTheDocument();
    // Verifica que los datos mostrados (no inputs) se actualizaron
    expect(screen.getByText('Juan Modificado')).toBeInTheDocument();
    expect(screen.getByText('987654321')).toBeInTheDocument();


  });

  test('calls logout API when "Cerrar Sesión" is clicked', async () => {
     render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
    await screen.findByText(mockUserData.nombre); // Espera carga

    // Mock para la llamada POST de logout
     global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, message: 'Logout exitoso' }),
    });


    const logoutButton = screen.getByRole('button', { name: /Cerrar Sesión/i });
    fireEvent.click(logoutButton);

    // Espera a que se llame a fetch (puede ser muy rápido)
    // Usamos waitFor para asegurarnos de que la llamada asíncrona se complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/logout',
        expect.objectContaining({ method: 'POST' })
      );
    });


  });

  test('calls delete API when "Eliminar Cuenta" is clicked after confirmation', async () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
    await screen.findByText(mockUserData.nombre); // Espera carga

     // Mock para la llamada DELETE
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, message: 'Cuenta eliminada' }),
    });


    const deleteButton = screen.getByRole('button', { name: /Eliminar Cuenta/i });
    fireEvent.click(deleteButton);

    // Verifica que se llamó a window.confirm
    expect(global.confirm).toHaveBeenCalledTimes(1);

     // Espera a que se llame a fetch (DELETE)
    await waitFor(() => {
       expect(global.fetch).toHaveBeenCalledWith(
         'http://localhost:3001/api/profile/me',
         expect.objectContaining({ method: 'DELETE' })
       );
    });

  });

});