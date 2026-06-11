import { useState } from "react";

export default function AuthForm({ onAuthSuccess, isLoading }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Email y contraseña son obligatorios");
      return;
    }
    if (!isLogin && !formData.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    if (!isLogin && formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      await onAuthSuccess({ isLogin, ...formData });
    } catch (err) {
      setError(err.message || "Algo salió mal, inténtalo de nuevo");
    }
  };

  const switchMode = () => {
    setIsLogin((v) => !v);
    setError("");
    setFormData({ name: "", email: "", password: "" });
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="af-shell">
        {/* Mode tabs */}
        <div className="af-tabs">
          <button
            type="button"
            className={`af-tab ${isLogin ? "af-tab--on" : ""}`}
            onClick={() => !isLogin && switchMode()}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={`af-tab ${!isLogin ? "af-tab--on" : ""}`}
            onClick={() => isLogin && switchMode()}
          >
            Crear cuenta
          </button>
        </div>

        <form className="af-form" onSubmit={handleSubmit} noValidate>
          {/* Greeting */}
          <p className="af-greeting">
            {isLogin
              ? "¡Bienvenido de vuelta! Entra y defiende tu puesto en la tabla."
              : "Únete a la quiniela y demuestra que sabes de fútbol."}
          </p>

          {/* Name (register only) */}
          {!isLogin && (
            <div className="af-field">
              <label className="af-label" htmlFor="af-name">Nombre</label>
              <input
                id="af-name"
                className="af-input"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Como quieres aparecer en la tabla"
                autoComplete="name"
                autoFocus
              />
            </div>
          )}

          <div className="af-field">
            <label className="af-label" htmlFor="af-email">Email</label>
            <input
              id="af-email"
              className="af-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              autoComplete="email"
              autoFocus={isLogin}
            />
          </div>

          <div className="af-field">
            <label className="af-label" htmlFor="af-password">Contraseña</label>
            <input
              id="af-password"
              className="af-input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={isLogin ? "••••••••" : "Mínimo 6 caracteres"}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          {error && (
            <div className="af-error" role="alert">
              <span className="af-error__icon">⚠</span>
              {error}
            </div>
          )}

          <button
            className="af-submit"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="af-spinner" />
            ) : isLogin ? (
              <>Entrar a la quiniela <span className="af-arrow">→</span></>
            ) : (
              <>Crear mi cuenta <span className="af-arrow">→</span></>
            )}
          </button>
        </form>
      </div>
    </>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────────────── */
const CSS = `
  .af-shell {
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 8px 48px rgba(0,0,0,.12);
    overflow: hidden;
    width: 100%;
    max-width: 420px;
    margin: 0 auto;
    font-family: system-ui, -apple-system, sans-serif;
  }

  /* Tabs */
  .af-tabs {
    display: flex;
    border-bottom: 2px solid #f2f2f2;
  }
  .af-tab {
    flex: 1;
    padding: 15px 0;
    background: none;
    border: none;
    font-size: 14px;
    font-weight: 600;
    color: #aaa;
    cursor: pointer;
    letter-spacing: .02em;
    transition: color .2s;
    position: relative;
  }
  .af-tab--on {
    color: #166534;
  }
  .af-tab--on::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0; right: 0;
    height: 2px;
    background: #166534;
    border-radius: 2px 2px 0 0;
  }

  /* Form body */
  .af-form {
    padding: 24px 28px 28px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .af-greeting {
    margin: 0;
    font-size: 13px;
    color: #777;
    line-height: 1.5;
    padding-bottom: 4px;
    border-bottom: 1px solid #f2f2f2;
  }

  /* Fields */
  .af-field {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }
  .af-label {
    font-size: 12px;
    font-weight: 700;
    color: #444;
    letter-spacing: .06em;
    text-transform: uppercase;
  }
  .af-input {
    padding: 13px 15px;
    border: 1.5px solid #e8e8e8;
    border-radius: 12px;
    font-size: 15px;
    color: #111;
    background: #fafafa;
    outline: none;
    transition: border-color .18s, background .18s;
  }
  .af-input:focus {
    border-color: #166534;
    background: #fff;
  }
  .af-input::placeholder {
    color: #bbb;
  }

  /* Error */
  .af-error {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background: #fef9e7;
    border: 1px solid #f6c026;
    border-radius: 10px;
    padding: 11px 14px;
    font-size: 13px;
    color: #5a3e00;
    line-height: 1.45;
  }
  .af-error__icon {
    flex-shrink: 0;
    font-size: 14px;
    margin-top: 1px;
  }

  /* Submit */
  .af-submit {
    margin-top: 4px;
    padding: 15px;
    background: linear-gradient(135deg, #14532d 0%, #16a34a 100%);
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: .01em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: opacity .2s, transform .1s;
  }
  .af-submit:hover:not(:disabled) {
    opacity: .92;
    transform: translateY(-1px);
  }
  .af-submit:active:not(:disabled) {
    transform: translateY(0);
  }
  .af-submit:disabled {
    opacity: .55;
    cursor: not-allowed;
  }
  .af-arrow {
    font-size: 17px;
    transition: transform .2s;
  }
  .af-submit:hover:not(:disabled) .af-arrow {
    transform: translateX(3px);
  }

  /* Spinner */
  .af-spinner {
    width: 18px;
    height: 18px;
    border: 2.5px solid rgba(255,255,255,.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: af-spin .7s linear infinite;
  }
  @keyframes af-spin { to { transform: rotate(360deg); } }
`;
