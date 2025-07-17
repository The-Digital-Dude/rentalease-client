import { RiAlertLine } from "react-icons/ri";
import "./PropertyErrorAlert.scss";

interface PropertyErrorAlertProps {
  error: string | null;
  onDismiss: () => void;
}

const PropertyErrorAlert = ({ error, onDismiss }: PropertyErrorAlertProps) => {
  if (!error) return null;

  return (
    <div className="alert alert-error">
      <RiAlertLine />
      <span>{error}</span>
      <button onClick={onDismiss}>×</button>
    </div>
  );
};

export default PropertyErrorAlert;
