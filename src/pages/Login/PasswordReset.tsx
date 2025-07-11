import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { 
  RiLockPasswordLine, 
  RiEyeLine, 
  RiEyeOffLine, 
  RiArrowLeftLine, 
  RiCheckLine, 
  RiKeyLine,
  RiArrowRightLine,
  RiMailLine
} from "react-icons/ri";
import { authService } from "../../services";
import { getUserTypeFromUrl, getUserTypeConfig } from "../../utils/userTypeUtils";
import "./Login.scss";

interface PasswordResetFormData {
  email: string;
  otp: string;
  password: string;
  confirmPassword: string;
}

const PasswordReset = () => {
  const [searchParams] = useSearchParams();
  const userType = getUserTypeFromUrl(searchParams);
  const userConfig = getUserTypeConfig(userType);
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PasswordResetFormData>({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const steps = [
    { number: 1, title: "Send OTP", description: "Enter your email address" },
    { number: 2, title: "Verify OTP", description: "Enter the 6-digit code" },
    { number: 3, title: "New Password", description: "Create your new password" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // For OTP, only allow numbers and limit to 6 digits
    if (name === 'otp') {
      const numericValue = value.replace(/\D/g, '').slice(0, 6);
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    return errors;
  };

  const handleStep1Submit = async () => {
    if (!formData.email) {
      setError("Email address is required.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await authService.forgotPassword(formData.email, userConfig.apiUserType);
      
      if (response.success) {
        setSuccess("6-digit OTP sent to your email successfully!");
        setTimeout(() => {
          setCurrentStep(2);
          setSuccess("");
        }, 1500);
      } else {
        setError(response.message || "Failed to send OTP. Please try again.");
      }
    } catch (error: any) {
      setError(error.message || "Failed to send OTP to your email. Please check your email address and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async () => {
    if (!formData.otp) {
      setError("OTP is required.");
      return;
    }

    if (formData.otp.length !== 6 || !/^\d{6}$/.test(formData.otp)) {
      setError("OTP must be exactly 6 digits.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await authService.verifyOTP(formData.email, formData.otp, userConfig.apiUserType);
      
      if (response.success) {
        setSuccess("OTP verified! Now create your new password.");
        setTimeout(() => {
          setCurrentStep(3);
          setSuccess("");
        }, 1500);
      } else {
        setError(response.message || "Invalid OTP. Please try again.");
      }
    } catch (error: any) {
      if (error.message?.includes("expired")) {
        setError("OTP has expired. Please start over.");
      } else if (error.message?.includes("invalid")) {
        setError("Invalid OTP. Please check and try again.");
      } else if (error.message?.includes("attempts")) {
        setError(error.message);
      } else {
        setError(error.message || "Failed to verify OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Submit = async () => {
    if (!formData.password || !formData.confirmPassword) {
      setError("Both password fields are required.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(". "));
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await authService.resetPasswordWithOTP(
        formData.email, 
        formData.otp, 
        formData.password, 
        userConfig.apiUserType
      );
      
      if (response.success) {
        setSuccess("🎉 Password reset successfully! Redirecting to login...");
        
        setTimeout(() => {
          navigate(userConfig.loginPath);
        }, 3000);
      } else {
        setError(response.message || "Failed to reset password. Please try again.");
      }
    } catch (error: any) {
      if (error.message?.includes("expired")) {
        setError("OTP has expired. Please start over.");
      } else if (error.message?.includes("invalid")) {
        setError("Invalid OTP. Please check and try again.");
      } else if (error.message?.includes("attempts")) {
        setError(error.message);
      } else {
        setError(error.message || "Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = () => {
    setError("");
    setSuccess("");
    
    if (currentStep === 1) {
      handleStep1Submit();
    } else if (currentStep === 2) {
      handleStep2Submit();
    } else if (currentStep === 3) {
      handleStep3Submit();
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                required
                autoFocus
              />
            </div>
          </>
        );

      case 2:
        return (
          <>
            <div className="step-info" style={{ 
              paddingTop: '1.5rem', 
              marginBottom: '1.5rem', 
              borderTop: '2px solid #f1f5f9',
              borderRadius: '8px 8px 0 0',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              padding: '1.5rem',
              marginTop: '-1rem'
            }}>
              <p style={{ margin: 0, color: '#64748b', fontWeight: '500' }}>
                We sent a 6-digit code to <strong style={{ color: '#024974' }}>{formData.email}</strong>
              </p>
            </div>
            <div className="form-group">
              <label htmlFor="otp">6-Digit OTP</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                placeholder="000000"
                maxLength={6}
                required
                autoFocus
                style={{ 
                  textAlign: 'center', 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  letterSpacing: '0.25em',
                  fontFamily: "'Courier New', monospace"
                }}
              />
              <small className="field-hint">Code expires in 10 minutes</small>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your new password"
                  required
                  autoFocus
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

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="password-input">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>

            <div className="password-requirements">
              <p>Password requirements:</p>
              <ul>
                <li className={formData.password.length >= 8 ? 'valid' : ''}>
                  At least 8 characters long
                </li>
                <li className={/(?=.*[a-z])/.test(formData.password) ? 'valid' : ''}>
                  One lowercase letter
                </li>
                <li className={/(?=.*[A-Z])/.test(formData.password) ? 'valid' : ''}>
                  One uppercase letter
                </li>
                <li className={/(?=.*\d)/.test(formData.password) ? 'valid' : ''}>
                  One number
                </li>
              </ul>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const getStepButtonText = () => {
    if (isLoading) {
      switch (currentStep) {
        case 1: return "Sending OTP...";
        case 2: return "Verifying...";
        case 3: return "Resetting Password...";
        default: return "Processing...";
      }
    }

    if (success && currentStep === 3) {
      return "Password Reset Complete!";
    }

    switch (currentStep) {
      case 1: return "Send OTP";
      case 2: return "Verify OTP";
      case 3: return "Reset Password";
      default: return "Next";
    }
  };



  return (
    <div className="login-container">
      <div className="login-card">
        {isLoading && (
          <div className="loading-overlay">
            <div className="overlay-content">
              <div className="loading-spinner"></div>
              <div className="loading-text">
                {currentStep === 1 && "Sending 6-digit OTP..."}
                {currentStep === 2 && "Verifying OTP..."}
                {currentStep === 3 && "Resetting your password..."}
              </div>
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
            <RiLockPasswordLine />
            <span>{userConfig.displayName} Password Reset</span>
          </div>
        </div>



        <form className="login-form" onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              <RiCheckLine style={{ marginRight: '0.5rem', fontSize: '1.125rem' }} />
              {success}
            </div>
          )}

          {renderStepContent()}

          <button 
            type="submit" 
            className="login-btn" 
            disabled={isLoading || Boolean(success && currentStep === 3)}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                {getStepButtonText()}
              </>
            ) : success && currentStep === 3 ? (
              <>
                <RiCheckLine />
                {getStepButtonText()}
              </>
            ) : (
              <>
                {getStepButtonText()}
                {currentStep < 3 && !isLoading && <RiArrowRightLine />}
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          {currentStep > 1 && !success && (
            <p>
              <a 
                href="#" 
                className="back-to-login"
                onClick={(e) => {
                  e.preventDefault();
                  if (!isLoading) {
                    setCurrentStep(currentStep - 1);
                  }
                }}
                style={{ opacity: isLoading ? 0.5 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
              >
                <RiArrowLeftLine />
                Back to previous step
              </a>
            </p>
          )}
          <p>
            <Link to={userConfig.loginPath} className="back-to-login">
              <RiArrowLeftLine />
              Back to {userConfig.displayName} Login
            </Link>
          </p>
          <p>
            Having trouble? <a href="#contact">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset; 