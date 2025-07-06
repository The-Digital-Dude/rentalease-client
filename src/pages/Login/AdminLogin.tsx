import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiShieldUserLine, RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { useAppDispatch } from "../../store";
import { login } from "../../store/userSlice";
import { authService } from "../../services";
import { getFullRoute } from "../../config/roleBasedRoutes";
import "./Login.scss";

interface LoginFormData {
  email: string;
  password: string;
}

const AdminLogin = () => {
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
      const response = await authService.login(formData.email, formData.password, "admin");
      
      if (response.success && response.data) {
        // Map API response to Redux store structure
        const userType = response.data.user.userType as any; // Cast to handle different user types
        
        dispatch(login({
          email: response.data.user.email,
          userType: userType,
          name: response.data.user.name,
          id: response.data.user.id,
        }));

        // Navigate to user's dashboard
        const dashboardPath = getFullRoute(userType, 'dashboard');
        navigate(dashboardPath);
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
        <div className="login-header">
          <div className="logo-container">
            <img
              src="/rentalease-logo.png"
              alt="RentalEase"
              className="login-logo"
            />
          </div>
          <div className="user-type-indicator admin">
            <RiShieldUserLine />
            <span>Admin Portal</span>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to your admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
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
            {isLoading ? "Signing in..." : "Sign in as Admin"}
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

export default AdminLogin;
