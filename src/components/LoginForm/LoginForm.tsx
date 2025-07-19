import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { useAppDispatch } from "../../store";
import { login } from "../../store/userSlice";
import type { UserType } from "../../store/userSlice";
import { authService } from "../../services";
import { defaultRoutes } from "../../config/roleBasedRoutes";
import "./LoginForm.scss";

interface LoginFormProps {
  userType: "admin" | "agent";
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  forgotPasswordLink: string;
  switchLoginLink: string;
  switchLoginText: string;
}

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  userType,
  title,
  subtitle,
  icon,
  forgotPasswordLink,
  switchLoginLink,
  switchLoginText,
}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.login(
        formData.email,
        formData.password,
        userType
      );

      if (response.success && response.data) {
        // Map API response to Redux store structure
        const userTypeFromResponse = response.data.user.userType as any;

        console.log("Login successful, userType:", userTypeFromResponse);
        console.log("Full response data:", response.data);

        dispatch(
          login({
            email: response.data.user.email,
            userType: userTypeFromResponse,
            name: response.data.user.name,
            id: response.data.user.id,
          })
        );

        console.log(
          "Login dispatch completed, userType:",
          userTypeFromResponse
        );

        // Navigate to dashboard after successful login
        const dashboardPath =
          (userTypeFromResponse &&
            defaultRoutes[userTypeFromResponse as UserType]) ||
          "/login";
        console.log("Navigating to dashboard:", dashboardPath);
        navigate(dashboardPath, { replace: true });
      } else {
        setError(response.message || "Login failed");
      }
    } catch (error: any) {
      setError(error.message || "Login failed. Please check your credentials.");
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
        {isLoading && (
          <div className="loading-overlay">
            <div className="overlay-content">
              <div className="loading-spinner"></div>
              <div className="loading-text">Authenticating...</div>
            </div>
          </div>
        )}
        <div className="login-header">
          <div className="logo-container">
            <img
              src="/rentalease-logo.png"
              alt="RentalEase"
              className="login-logo"
            />
          </div>
          <div className={`user-type-indicator ${userType}`}>
            {icon}
            <span>{title}</span>
          </div>
          <h1>Welcome Back</h1>
          <p>{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

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
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Signing in...
              </>
            ) : (
              `Sign in as ${
                userType.charAt(0).toUpperCase() + userType.slice(1)
              }`
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            <Link to={forgotPasswordLink}>Forgot your password?</Link>
          </p>
          <p>
            <Link to={switchLoginLink}>{switchLoginText}</Link>
          </p>
          <p>
            Having trouble signing in? <a href="#contact">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
};
