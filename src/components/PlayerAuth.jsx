import { useTranslation } from '../hooks/useTranslation';

export default function PlayerAuth({ currentPlayer, formValues, setFormValues, onLogout }) {
  const { t } = useTranslation();

  const handleInputChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  if (currentPlayer) {
    return (
      <div className="session-card" id="sessionCard">
        <div>
          <strong id="sessionName">{currentPlayer.name}</strong>
          <small id="sessionEmail">{currentPlayer.email}</small>
        </div>
        <button
          className="ghost"
          id="logoutPlayerBtn"
          type="button"
          onClick={onLogout}
        >
          {t("logoutPlayerBtn")}
        </button>
      </div>
    );
  }

  return (
    <div className="form-grid" id="playerForm">
      <label htmlFor="playerName">
        <span>{t("nameLabel")}</span>
        <input
          id="playerName"
          autoComplete="name"
          maxLength={60}
          placeholder={t("nameLabel") === "Nombre" ? "Tu nombre" : "Your name"}
          value={formValues.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
        />
      </label>
      <label htmlFor="playerEmail">
        <span>{t("emailLabel")}</span>
        <input
          id="playerEmail"
          autoComplete="email"
          type="email"
          maxLength={120}
          placeholder={t("emailLabel") === "Correo electrónico" ? "tu@email.com" : "you@email.com"}
          value={formValues.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
        />
      </label>
    </div>
  );
}
