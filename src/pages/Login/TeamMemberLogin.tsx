import { useState, useRef, useEffect } from "react";
import { RiTeamLine, RiEyeLine, RiEyeOffLine, RiArrowLeftLine } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch } from "../../store";
import { login } from "../../store/userSlice";
import { authService } from "../../services";
import "./Login.scss";

const TeamMemberLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark-mode')
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailInputRef.current?.focus();

    // Listen for dark mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark-mode'));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.loginTeamMember({
        email: formData.email,
        password: formData.password,
      });

      if (response.status === "success") {
        // Store auth token
        localStorage.setItem("authToken", response.data.token);

        // Dispatch login action
        dispatch(
          login({
            email: response.data.teamMember.email,
            userType: "team_member",
            name: response.data.teamMember.name,
            id: response.data.teamMember._id,
          })
        );

        toast.success("Welcome back to RentalEase!", {
          icon: "👋",
          style: {
            borderRadius: "10px",
            background: "#10b981",
            color: "#fff",
          },
        });

        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Team member login error:", err);
      const errorMessage = err.response?.data?.message || "Login failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <img
              src={isDarkMode ? "/rentalease-logo-light.png" : "/rentalease-logo.png"}
              alt="RentalEase"
              className="login-logo"
            />
          </div>
          <div className="user-type-indicator team-member">
            <RiTeamLine />
            <span>Team Member Portal</span>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to your team member account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              ref={emailInputRef}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              required
              disabled={isLoading}
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
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
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
              "Sign In"
            )}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/password-reset" className="forgot-password">
            Forgot your password?
          </Link>
          <p>
            <Link to="/" className="back-to-login">
              <RiArrowLeftLine />
              Back to login options
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberLogin;