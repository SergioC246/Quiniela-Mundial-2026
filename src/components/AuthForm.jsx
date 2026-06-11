import { useState } from "react";

export default function AuthForm({ onAuthSuccess, isLoading }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    if (!isLogin && !formData.name) {
      setError("Name is required");
      return;
    }

    try {
      await onAuthSuccess({
        isLogin,
        ...formData
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-form">
      <div className="auth-header">
        <h3>{isLogin ? "Login" : "Register"}</h3>
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError("");
            setFormData({ name: "", email: "", password: "" });
          }}
          className="link-btn"
        >
          {isLogin ? "Create account" : "Already have account?"}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <label>
            <span>Name</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
            />
          </label>
        )}

        <label>
          <span>Email</span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
          />
        </label>

        <label>
          <span>Password</span>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
          />
        </label>

        {error && <div className="msg err">{error}</div>}

        <button
          type="submit"
          disabled={isLoading}
          className="primary"
        >
          {isLoading ? "Loading..." : isLogin ? "Login" : "Register"}
        </button>
      </form>
    </div>
  );
}
