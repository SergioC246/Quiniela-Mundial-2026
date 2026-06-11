import { useTranslation } from '../hooks/useTranslation';

export default function StatusPills({ storageMode, apiStatusText }) {
  const { t } = useTranslation();

  const getStorageText = () => {
    if (storageMode === "shared") return t("storageShared");
    if (storageMode === "local") return t("storageLocal");
    return t("storageChecking");
  };

  return (
    <div className="status-row">
      <span className="pill">
        <span className={`dot ${storageMode === 'checking' ? 'dot-checking' : ''}`}></span>
        <span>{getStorageText()}</span>
      </span>
      {apiStatusText && (
        <span className="pill" id="apiStatus">
          <span>{apiStatusText}</span>
        </span>
      )}
    </div>
  );
}
