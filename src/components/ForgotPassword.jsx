import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // Icons for password visibility
import "../index.css"; // Estilos compartidos

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Estado para controlar el paso actual del proceso
  // 1: Enter identifier, 2: Answer question, 3: Reset password
  const [step, setStep] = useState(1);

  // Estados para los datos del formulario y del proceso
  const [identifier, setIdentifier] = useState(""); // Email o Username
  const [credentialId, setCredentialId] = useState(null); // ID de credenciales obtenido
  const [securityQuestion, setSecurityQuestion] = useState(""); // Pregunta obtenida
  const [securityAnswer, setSecurityAnswer] = useState(""); // Respuesta ingresada por el usuario
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Estados para UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- Paso 1: Validar Usuario y Obtener ID ---
  const handleValidateUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/forgot-password/validate-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const data = await response.json();

      if (response.ok && data.success && data.credentialId) {
        // Usuario encontrado, guardar ID y pasar a obtener pregunta
        setCredentialId(data.credentialId);
        await handleGetQuestion(data.credentialId); // Llama a la siguiente función
      } else if (response.ok && data.success && !data.credentialId) {
         // Backend simula éxito aunque no exista (por seguridad)
         setError("Si existe una cuenta asociada, recibirás instrucciones (Revisa consola backend si no avanza).");
         // En un caso real, aquí se podría enviar un email en lugar de continuar
      }
      else {
        throw new Error(data.message || `Error ${response.status}`);
      }
    } catch (err) {
      console.error("Error validando usuario:", err);
      setError(err.message || "Error al verificar el usuario.");
    } finally {
       // No poner setLoading(false) aquí, porque handleGetQuestion lo hará
    }
  };

  // --- Paso 1.5: Obtener Pregunta de Seguridad ---
  const handleGetQuestion = async (credId) => {
    // setLoading(true) ya está activo desde handleValidateUser
    try {
      const response = await fetch("http://localhost:3001/api/forgot-password/get-question", {
        method: "POST", // Cambiado a POST en backend v3
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentialId: credId }), // Enviar ID en body
      });
      const data = await response.json();

      if (response.ok && data.success && data.question) {
        setSecurityQuestion(data.question); // Guarda la pregunta
        setStep(2); // Avanza al paso de responder la pregunta
      } else {
         // Error al obtener pregunta (ID inválido, no hay pregunta, etc.)
        throw new Error(data.message || `Error ${response.status}`);
      }
    } catch (err) {
      console.error("Error obteniendo pregunta:", err);
      setError(err.message || "No se pudo obtener la pregunta de seguridad.");
      // Si falla aquí, no podemos continuar, reseteamos credentialId
      setCredentialId(null);
    } finally {
       setLoading(false); // Ahora sí, termina la carga combinada
    }
  };


  // --- Paso 2: Validar Respuesta de Seguridad ---
  const handleValidateAnswer = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/forgot-password/validate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentialId, answer: securityAnswer }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setStep(3); // Avanza al paso de resetear contraseña
      } else {
        // Respuesta incorrecta u otro error
        throw new Error(data.message || `Error ${response.status}`);
      }
    } catch (err) {
      console.error("Error validando respuesta:", err);
      setError(err.message || "Error al validar la respuesta.");
    } finally {
      setLoading(false);
    }
  };

  // --- Paso 3: Resetear Contraseña ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setError("Las nuevas contraseñas no coinciden.");
      return;
    }
    // Validar longitud mínima
    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/forgot-password/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentialId, newPassword }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess("¡Contraseña actualizada exitosamente! Redirigiendo al login...");
        setTimeout(() => {
          navigate("/login"); // Redirige a login después de 2 segundos
        }, 2000);
      } else {
        throw new Error(data.message || `Error ${response.status}`);
      }
    } catch (err) {
      console.error("Error reseteando contraseña:", err);
      setError(err.message || "Error al actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  };


  // --- Renderizado Condicional por Pasos ---
  const renderStepContent = () => {
    switch (step) {
      // --- PASO 1: INGRESAR IDENTIFICADOR ---
      case 1:
        return (
          <form onSubmit={handleValidateUser}>
            <p className="welcome-text">Ingresa tu correo o nombre de usuario para iniciar la recuperación.</p>
            <input
              type="text"
              placeholder="Correo electrónico o nombre de usuario"
              className="input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              disabled={loading}
            />
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? "Verificando..." : "Continuar"}
            </button>
          </form>
        );

      // --- PASO 2: RESPONDER PREGUNTA ---
      case 2:
        return (
          <form onSubmit={handleValidateAnswer}>
            <p className="welcome-text">Responde tu pregunta de seguridad:</p>
            {/* Muestra la pregunta obtenida */}
            <div className="profile-field readonly" style={{ marginBottom: '15px' }}>
                <label>Pregunta:</label>
                <span>{securityQuestion}</span>
            </div>
            {/* Input para la respuesta */}
            <input
              type="password" // Ocultar la respuesta
              placeholder="Tu respuesta secreta"
              className="input"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              required
              disabled={loading}
            />
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? "Validando..." : "Verificar Respuesta"}
            </button>
             {/* Opción para volver atrás (resetea el estado) */}
             <button type="button" onClick={() => { setStep(1); setCredentialId(null); setSecurityQuestion(''); setError(''); }} className="btn-link-back" disabled={loading}>
                Volver
             </button>
          </form>
        );

      // --- PASO 3: INGRESAR NUEVA CONTRASEÑA ---
      case 3:
        return (
          <form onSubmit={handleResetPassword}>
            <p className="welcome-text">Ingresa tu nueva contraseña.</p>
            {/* Nueva Contraseña */}
            <div className="password-wrapper">
                <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Nueva contraseña (mín. 6 caracteres)"
                    className="input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required minLength="6" disabled={loading}
                />
                <span className="toggle-password" onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                </span>
            </div>
            {/* Confirmar Nueva Contraseña */}
            <div className="password-wrapper">
                <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmar nueva contraseña"
                    className="input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required minLength="6" disabled={loading}
                />
                 <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                </span>
            </div>
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar Contraseña"}
            </button>
          </form>
        );
      default:
        return <p>Paso desconocido.</p>; // Caso inesperado
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* Panel izquierdo */}
        <div className="login-left">
          <h1>Recuperar Contraseña</h1>

          {/* Muestra mensajes de error/éxito */}
          {error && <p className="profile-message error">{error}</p>}
          {success && <p className="profile-message success">{success}</p>}

          {/* Renderiza el contenido del paso actual */}
          {!success && renderStepContent()} {/* No renderiza el form si ya hay éxito */}


          {/* Enlace para volver a Iniciar Sesión (si no está en proceso de éxito) */}
          {!success && (
             <div className="signup-link">
                ¿Recordaste tu contraseña? <a href="/login">Inicia sesión</a>
             </div>
          )}
        </div>

        {/* Panel derecho (igual que antes) */}
        <div className="login-right">
          <div className="login-right-buttons">
            <a href="/register" className="btn-text">Registrarse</a>
            <a href="#" className="btn-outline">Ayuda</a>
          </div>
          <div className="login-right-text">
            <h2>Recupera tu acceso a MediSync</h2>
            <p>
              Sigue los pasos para restablecer tu contraseña de forma segura utilizando tu pregunta secreta.
            </p>
          </div>
        </div>
      </div>
      {/* Estilo para el botón 'Volver' (puedes añadirlo a index.css o Profile.css si prefieres) */}
      <style jsx>{`
        .btn-link-back {
          background: none;
          border: none;
          color: #1d4ed8; /* Azul similar a otros enlaces */
          cursor: pointer;
          text-decoration: underline;
          padding: 10px 0;
          margin-top: 10px;
          font-size: 14px;
          display: block; /* Para que ocupe su línea */
          text-align: center;
        }
        .btn-link-back:disabled {
          color: #aaa;
          text-decoration: none;
          cursor: not-allowed;
        }
        .profile-field.readonly span { /* Estilo copiado de Profile.css para mostrar la pregunta */
            color: #666;
            background-color: #f8f8f8;
            padding: 10px;
            border-radius: 8px;
            display: block; /* Asegura que ocupe el ancho */
            word-wrap: break-word;
        }
        .profile-field.readonly label { /* Estilo copiado de Profile.css */
            font-weight: 600;
            color: #555;
            font-size: 14px;
            margin-bottom: 5px; /* Espacio entre label y span */
        }
      `}</style>
    </div>
  );
}