import { useTheme } from '../../contexts/ThemeContext';
import { RiMoonLine, RiSunLine } from 'react-icons/ri';
import './ThemeToggle.scss';

const ThemeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleDarkMode}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <div className="theme-toggle__track">
        <div className="theme-toggle__thumb">
          <RiSunLine className="theme-toggle__sun" />
          <RiMoonLine className="theme-toggle__moon" />
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;