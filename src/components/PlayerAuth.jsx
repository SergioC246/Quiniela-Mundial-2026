import { useTranslation } from "../hooks/useTranslation";

export default function PlayerAuth({
  currentPlayer,
  formValues,
  setFormValues,
  onLogout,
}) {
  const { t } = useTranslation();

  const handleInputChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  if (currentPlayer) {
    return (
      <div className="session-card">
        <div>
          <strong>{currentPlayer.name}</strong>
          <small>{currentPlayer.email}</small>
        </div>
        <button onClick={onLogout}>{t("logoutPlayerBtn")}</button>
      </div>
    );
  }

  return (
    <div className="form-grid">
      <label>
        <span>{t("nameLabel")}</span>
        <input
          value={formValues.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
        />
      </label>

      <label>
        <span>{t("emailLabel")}</span>
        <input
          type="email"
          value={formValues.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
        />
      </label>
    </div>
  );
}
