import {
  RiUser3Line,
  RiShieldUserLine,
  RiArrowRightLine,
  RiToolsLine,
  RiBuilding2Line,
} from "react-icons/ri";
import { Link } from "react-router-dom";
import "./Login.scss";

const Login = () => {
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
          <h1>Welcome to RentalEase</h1>
          <p>Choose your login type to continue</p>
        </div>

        <div className="login-options">
          <Link to="/login/agent" className="login-option-card">
            <div className="option-icon agent">
              <RiUser3Line />
            </div>
            <div className="option-content">
              <h3>Agency Login</h3>
              <p>
                Access your Agency dashboard, manage properties, and handle
                client requests
              </p>
            </div>
            <div className="option-arrow">
              <RiArrowRightLine />
            </div>
          </Link>

          <Link to="/login/property-manager" className="login-option-card">
            <div className="option-icon property-manager">
              <RiBuilding2Line />
            </div>
            <div className="option-content">
              <h3>Property Manager Login</h3>
              <p>
                Access property management portal, oversee properties, and
                manage property operations
              </p>
            </div>
            <div className="option-arrow">
              <RiArrowRightLine />
            </div>
          </Link>

          <Link to="/login/admin" className="login-option-card">
            <div className="option-icon admin">
              <RiShieldUserLine />
            </div>
            <div className="option-content">
              <h3>Admin Login</h3>
              <p>
                Access admin panel, manage users, and oversee system operations
              </p>
            </div>
            <div className="option-arrow">
              <RiArrowRightLine />
            </div>
          </Link>

          <Link to="/login/technician" className="login-option-card">
            <div className="option-icon technician">
              <RiToolsLine />
            </div>
            <div className="option-content">
              <h3>Technician Login</h3>
              <p>
                Access technician portal, manage jobs, and update work status
              </p>
            </div>
            <div className="option-arrow">
              <RiArrowRightLine />
            </div>
          </Link>
        </div>

        <div className="login-footer">
          <p>
            Having trouble signing in? <a href="#contact">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
