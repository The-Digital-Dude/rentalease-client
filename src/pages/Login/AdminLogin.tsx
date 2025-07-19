import { RiShieldUserLine } from "react-icons/ri";
import { LoginForm } from "../../components/LoginForm";

const AdminLogin = () => {
  return (
    <LoginForm
      userType="admin"
      title="Admin Portal"
      subtitle="Sign in to your admin account"
      icon={<RiShieldUserLine />}
      forgotPasswordLink="/password-reset?type=admin"
      switchLoginLink="/login/agent"
      switchLoginText="Agent Login"
    />
  );
};

export default AdminLogin;
