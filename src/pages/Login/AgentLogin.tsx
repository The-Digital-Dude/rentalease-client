import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { RiUser3Line, RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { useDispatch } from "react-redux";
import { login } from "../../store/userSlice";
import type { UserType } from "../../store/userSlice";
import { authService } from "../../services";
import { defaultRoutes } from "../../config/roleBasedRoutes";
import "./Login.scss";

export const AgentLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.login(email, password, "agent");

      if (response.success && response.data) {
        const { user } = response.data;

        // Store user data in Redux
        dispatch(
          login({
            email: user.email,
            userType: user.userType as UserType,
            name: user.name,
            id: user.id,
          })
        );

        // Navigate to dashboard after successful login
        const dashboardPath =
          (user.userType && defaultRoutes[user.userType as UserType]) ||
          "/login";
        console.log("Navigating to dashboard:", dashboardPath);
        navigate(dashboardPath, { replace: true });
      } else {
        setError(response.message || "Login failed");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <img src="/rentalease-logo.png" alt="RentalEase Logo" />
          </div>
          <div className="user-type-indicator agent">
            <RiUser3Line />
            <span>Agent Portal</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className={`btn-primary ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="login-links">
            <Link to="/forgot-password">Forgot Password?</Link>
            <Link to="/login">Admin Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
