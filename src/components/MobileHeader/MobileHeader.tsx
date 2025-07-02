import { RiMenuLine } from "react-icons/ri";
import "./MobileHeader.scss";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

const MobileHeader = ({ onMenuClick }: MobileHeaderProps) => {
  return (
    <header className="mobile-header">
      <button className="mobile-menu-button" onClick={onMenuClick}>
        <RiMenuLine />
      </button>
      <h1 className="mobile-title">Rentalease</h1>
    </header>
  );
};

export default MobileHeader;
