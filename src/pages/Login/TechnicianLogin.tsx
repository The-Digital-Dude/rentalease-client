import { RiToolsLine } from "react-icons/ri";
import { LoginForm } from "../../components/LoginForm";

export const TechnicianLogin = () => {
  return (
    <LoginForm
      userType="technician"
      title="Technician Portal"
      subtitle="Sign in to your technician account"
      icon={<RiToolsLine />}
      forgotPasswordLink="/password-reset?type=technician"
      switchLoginLink="/login"
      switchLoginText="Back to Login"
    />
  );
};
