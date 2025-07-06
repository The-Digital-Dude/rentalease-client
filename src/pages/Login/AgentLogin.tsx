import { useState } from "react";
import { RiUser3Line, RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import "./Login.scss";

interface LoginFormData {
  email: string;
  password: string;
}

const AgentLogin = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Agent login:", formData);
      // Here you would typically make an API call to authenticate
      // await authService.login(formData.email, formData.password, "agent");

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Handle successful login
      console.log("Agent login successful");
    } catch (error) {
      console.error("Agent login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <img
              src="/rentalease-logo.png"
              alt="RentalEase"
              className="login-logo"
            />
          </div>
          <div className="user-type-indicator agent">
            <RiUser3Line />
            <span>Agent Portal</span>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to your agent account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in as Agent"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Having trouble signing in? <a href="#contact">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentLogin;
