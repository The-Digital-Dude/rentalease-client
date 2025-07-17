import { RiHomeLine, RiRefreshLine, RiAddLine } from "react-icons/ri";
import "./PropertiesHeader.scss";

interface PropertiesHeaderProps {
  onRefresh: () => void;
  onAddProperty: () => void;
  loading: boolean;
}

const PropertiesHeader = ({
  onRefresh,
  onAddProperty,
  loading,
}: PropertiesHeaderProps) => {
  return (
    <div className="page-header">
      <div className="header-content">
        <div className="header-text">
          <h1>
            <RiHomeLine className="header-icon" />
            Properties
          </h1>
          <p>
            Manage your property portfolio with comprehensive tracking and
            compliance monitoring
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={onRefresh}
            disabled={loading}
          >
            <RiRefreshLine />
            Refresh
          </button>
          <button className="btn btn-primary" onClick={onAddProperty}>
            <RiAddLine />
            Add Property
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesHeader;
