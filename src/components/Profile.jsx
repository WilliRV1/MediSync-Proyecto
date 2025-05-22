import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', fechaNacimiento: '', telefono: '', direccion: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  useEffect(() => {
    const fetchProfile = async () => {
      setError(''); setSuccess(''); setLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/profile/me', {
          method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        });
        if (!response.ok) {
          if (response.status === 401) { navigate('/login'); return; }
          const errorData = await response.json();
          throw new Error(errorData.message || `Error ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.user) {
          setUserData(data.user);
          const formattedDate = data.user.fechaNacimiento ? new Date(data.user.fechaNacimiento).toISOString().split('T')[0] : '';
          setFormData({
            nombre: data.user.nombre || '', apellido: data.user.apellido || '',
            fechaNacimiento: formattedDate, telefono: data.user.telefono || '', direccion: data.user.direccion || '',
          });
        } else { throw new Error(data.message || 'No se pudieron obtener los datos del perfil.'); }
      } catch (err) { console.error('Error al cargar perfil:', err); setError(`Error al cargar perfil: ${err.message}`);
      } finally { setLoading(false); }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setError(''); setSuccess('');
  };

  const handleUpdate = async (event) => {
    
    if (event) event.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    const updatePayload = {
      nombre: formData.nombre, apellido: formData.apellido,
      fechaNacimiento: formData.fechaNacimiento || null,
      telefono: formData.telefono, direccion: formData.direccion,
    };
    try {
      const response = await fetch('http://localhost:3001/api/profile/me', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(updatePayload),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUserData(prevData => ({ ...prevData, ...data.user }));
        setSuccess('Perfil actualizado exitosamente.'); setIsEditing(false);
      } else { throw new Error(data.message || `Error ${response.status}`); }
    } catch (err) { console.error('Error al actualizar perfil:', err); setError(`Error al actualizar: ${err.message}`);
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    setError(''); setSuccess('');
    if (window.confirm('¿Estás seguro?')) {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/profile/me', {
          method: 'DELETE', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        });
        const data = await response.json();
        if (response.ok && data.success) {
          localStorage.setItem('successMessage', 'Cuenta eliminada');
          navigate('/login');
        }
        else { throw new Error(data.message || `Error ${response.status}`); }
      } catch (err) { console.error('Error al eliminar cuenta:', err); setError(`Error al eliminar: ${err.message}`);
      } finally { setLoading(false); }
    }
  };

  const handleLogout = async () => {
    setError(''); setSuccess(''); setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/logout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      });
      const data = await response.json();
      if (response.ok && data.success) { console.log('Logout exitoso'); navigate('/login'); }
      else { throw new Error(data.message || `Error ${response.status}`); }
    } catch (err) { console.error('Error al cerrar sesión:', err); setError(`Error al cerrar sesión: ${err.message}`); navigate('/login');
    } finally { setLoading(false); }
  };


  if (loading && !userData) return <div className="profile-container"><p>Cargando...</p></div>;
  if (error && !userData) return <div className="profile-container"><p style={{ color: 'red' }}>{error}</p></div>;
  if (!userData) return <div className="profile-container"><p>No se pudo cargar.</p></div>;

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <h1>Perfil de Usuario</h1>

        {error && <p className="profile-message error">{error}</p>}
        {success && <p className="profile-message success">{success}</p>}

        <div className="profile-main-content">

          {/* Columna Izquierda: Formulario SIN los botones de acción */}
          {/* Añadimos un id al form para asociar el botón submit externo */}
          <form onSubmit={handleUpdate} className="profile-form" id="profile-edit-form">
            {/* Campos del perfil (igual que antes) */}
            <div className="profile-field">
            <label htmlFor="nombre">Nombre:</label>
              {isEditing ? ( <input id="nombre" type="text" name="nombre" value={formData.nombre} onChange={handleChange} disabled={loading} className="input" /> ) : ( <span>{userData.nombre || 'No especificado'}</span> )}
            </div>
            {/* ... otros campos ... */}
             <div className="profile-field">
                <label>Apellido:</label>
                {isEditing ? ( <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} disabled={loading} className="input" /> ) : ( <span>{userData.apellido || 'No especificado'}</span> )}
             </div>
             <div className="profile-field"><label>Correo Electrónico:</label><span>{userData.correo}</span></div>
             <div className="profile-field"><label>Nombre de Usuario:</label><span>{userData.username}</span></div>
             <div className="profile-field">
                <label>Fecha de Nacimiento:</label>
                {isEditing ? ( <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} disabled={loading} className="input"/> ) : ( <span>{formData.fechaNacimiento || 'No especificada'}</span> )}
             </div>
             <div className="profile-field">
             <label htmlFor="telefono">Teléfono:</label>

               {isEditing ? ( <input id="telefono" type="tel" name="telefono" value={formData.telefono} onChange={handleChange} disabled={loading} className="input"/> ) : ( <span>{userData.telefono || 'No especificado'}</span> )}
             </div>
             <div className="profile-field">
             <label htmlFor="direccion">Dirección:</label>
               {isEditing ? ( <input id="direccion" type="text" name="direccion" value={formData.direccion} onChange={handleChange} disabled={loading} className="input"/> ) : ( <span>{userData.direccion || 'No especificada'}</span> )}
             </div>
             <div className="profile-field readonly"><label>Rol:</label><span>{userData.rol}</span></div>
             <div className="profile-field readonly"><label>Estado Cuenta:</label><span>{userData.estadoCuenta}</span></div>
             <div className="profile-field readonly"><label>Miembro desde:</label><span>{new Date(userData.createdAt).toLocaleDateString()}</span></div>
             <div className="profile-field readonly"><label>Último Acceso:</label><span>{userData.ultimoAcceso ? new Date(userData.ultimoAcceso).toLocaleString() : 'Nunca'}</span></div>

            {/* Los botones de acción del formulario YA NO VAN AQUÍ */}
            {/* <div className="profile-actions"> ... </div> */}
          </form>

          {/* Columna Derecha: TODOS los botones */}
          <div className="profile-footer-actions"> {/* Usamos el mismo contenedor */}

               {/* Bloque de botones Editar/Guardar/Cancelar */}
               {/* Se renderiza condicionalmente basado en isEditing */}
               <div className="profile-actions"> {/* Mantenemos la clase por si tiene estilos específicos */}
                 {isEditing ? (
                   <>
                     {/* Asociamos el botón submit al formulario usando el atributo 'form' */}
                     <button type="submit" form="profile-edit-form" className="btn-profile primary" disabled={loading}>
                       {loading ? 'Guardando...' : 'Guardar Cambios'}
                     </button>
                     <button type="button" className="btn-profile secondary" onClick={() => setIsEditing(false)} disabled={loading}>
                       Cancelar
                     </button>
                   </>
                 ) : (
                   <button type="button" className="btn-profile primary" onClick={() => setIsEditing(true)} disabled={loading}>
                     Editar Perfil
                   </button>
                 )}
               </div>

              {/* Divisor opcional para separar los grupos de botones */}
              <hr className="button-divider" />

               {/* Botones de Logout y Eliminar Cuenta */}
               <button onClick={handleLogout} className="btn-profile secondary logout" disabled={loading}>
                   {loading ? 'Cerrando...' : 'Cerrar Sesión'}
               </button>
               <button onClick={handleDelete} className="btn-profile danger" disabled={loading}>
                   {loading ? 'Eliminando...' : 'Eliminar Cuenta'}
               </button>
           </div>

        </div>

      </div>
    </div>
  );
}