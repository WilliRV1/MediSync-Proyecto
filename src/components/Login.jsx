import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "../index.css"; // Estilos compartidos

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  // Verificar si hay un mensaje de éxito guardado en localStorage
  useEffect(() => {
    const message = localStorage.getItem("successMessage");
    if (message) {
      setSuccess(message);
      localStorage.removeItem("successMessage"); // Eliminarlo después de mostrarlo
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({ identifier: identifier, password: password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("Login exitoso, redirigiendo al perfil...");
        navigate("/profile");
      } else {
        setError(data.message || `Error ${response.status}: No se pudo iniciar sesión.`);
        console.error("Error de login:", data.message || `Status ${response.status}`);
      }
    } catch (err) {
      console.error("Error de conexión en login:", err);
      setError("No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">

      

        <div className="login-left">
        {success && <p className="success">{success}</p>}
          <h1>¡Bienveni@!</h1>
          <p className="welcome-text">Accede a tu cuenta para gestionar tus citas médicas</p>

          <input
            type="text"
            placeholder="Correo electrónico o nombre de usuario"
            className="input"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            disabled={loading}
            required
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </span>
          </div>

          {error && <p style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</p>}

          <div className="forgot-password">
            <a href="/forgot-password">¿Olvidaste tu contraseña?</a>
          </div>

          <button className="btn-login" onClick={handleSubmit} disabled={loading}>
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>

          <div className="signup-link">
            ¿No tienes una cuenta? <a href="/register">Regístrate</a>
          </div>
        </div>

        <div className="login-right">
          <div className="login-right-buttons">
            <a href="/register" className="btn-text">Registrarse</a>
            <a href="#" className="btn-outline">Ayuda</a>
          </div>
          <div className="login-right-text">
            <h2>Gestión eficiente de citas médicas con MediSync</h2>
            <p>
              MediSync centraliza la administración de citas en la Red de Clínicas Salud Total.
              Simplifica la programación, mejora la atención y optimiza cada proceso con tecnología avanzada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
