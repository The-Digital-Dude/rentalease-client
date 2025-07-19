import { RiUser3Line } from "react-icons/ri";
import { LoginForm } from "../../components/LoginForm";

export const AgentLogin = () => {
  return (
    <LoginForm
      userType="agent"
      title="Agent Portal"
      subtitle="Sign in to your agent account"
      icon={<RiUser3Line />}
      forgotPasswordLink="/password-reset?type=agent"
      switchLoginLink="/login"
      switchLoginText="Admin Login"
    />
  );
};
