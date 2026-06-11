import { useTranslation } from "../hooks/useTranslation";

export default function UserProfile({ user, onLogout }) {
  const { t } = useTranslation();

  return (
    <div className="session-card">
      <div>
        <strong>{user.name}</strong>
        <small>{user.email}</small>
      </div>
      <button onClick={onLogout}>{t("logoutPlayerBtn")}</button>
    </div>
  );
}
