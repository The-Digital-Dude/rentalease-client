import { RiBuilding2Line } from "react-icons/ri";
import { LoginForm } from "../../components/LoginForm";

export const PropertyManagerLogin = () => {
  return (
    <LoginForm
      userType="propertyManager"
      title="Property Manager Portal"
      subtitle="Sign in to your property manager account"
      icon={<RiBuilding2Line />}
      forgotPasswordLink="/password-reset?type=propertyManager"
      switchLoginLink="/login"
      switchLoginText="Other Login Options"
    />
  );
}; 